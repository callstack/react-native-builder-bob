import { createRequire } from 'node:module';
import { platform } from 'node:os';
import path from 'node:path';
import { deleteAsync } from 'del';
import fs from 'fs-extra';
import { glob } from 'glob';
import JSON5 from 'json5';
import kleur from 'kleur';
import ts from 'typescript';
import which from 'which';
import type { Input, Variants } from '../types.ts';
import { isCodegenSpec } from '../utils/isCodegenSpec.ts';
import {
  resolveModuleSpecifier,
  SOURCE_EXTENSIONS,
} from '../utils/resolveModuleSpecifier.ts';
import { spawn } from '../utils/spawn.ts';
import { type Replacement, updateSourceMap } from '../utils/updateSourceMap.ts';

type Options = Input & {
  options?: {
    project?: string;
    tsc?: string;
  };
  esm: boolean;
  variants: Variants;
};

type Field = {
  name: string;
  value: string | undefined;
  output: string | undefined;
  error: boolean;
  message: string | undefined;
};

const DECLARATION_EXTENSIONS = [{ source: 'd.ts', output: 'js' }];

const EXPLICIT_SOURCE_EXTENSIONS = ['ts', 'tsx'].map((source) => ({
  source,
  emitted: DECLARATION_EXTENSIONS,
}));

const DECLARATION_REWRITE_BATCH_SIZE = 32;

const getModuleSpecifier = (node: ts.Node) => {
  if (
    (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
    node.moduleSpecifier &&
    ts.isStringLiteral(node.moduleSpecifier)
  ) {
    return node.moduleSpecifier;
  }

  if (
    ts.isImportTypeNode(node) &&
    ts.isLiteralTypeNode(node.argument) &&
    ts.isStringLiteral(node.argument.literal)
  ) {
    return node.argument.literal;
  }

  return undefined;
};

const rewriteDeclarationImports = async (
  output: string,
  source: string,
  root: string,
  codegenEnabled: boolean
) => {
  const isCodegenImport = (filepath: string, specifier: string) => {
    if (!codegenEnabled || !specifier.startsWith('.')) {
      return false;
    }

    // The declaration output mirrors the source tree, so map the import back to the source file
    const target = path.resolve(path.dirname(filepath), specifier);
    const relative = path.relative(output, target);

    // The tree root depends on tsc's inferred `rootDir`, so check both the project and source roots
    return [root, source].some((base) => {
      const candidate = path.join(base, relative);

      return (
        isCodegenSpec(candidate) ||
        SOURCE_EXTENSIONS.some((ext) => isCodegenSpec(`${candidate}.${ext}`))
      );
    });
  };

  const files = await glob('**/*.d.ts', {
    cwd: output,
    absolute: true,
    nodir: true,
  });

  // Process files in chunks to avoid firing read/writes for each file at once
  for (let i = 0; i < files.length; i += DECLARATION_REWRITE_BATCH_SIZE) {
    const promises = files
      .slice(i, i + DECLARATION_REWRITE_BATCH_SIZE)
      .map(async (filepath) => {
        const code = await fs.readFile(filepath, 'utf-8');
        const sourceFile = ts.createSourceFile(
          filepath,
          code,
          ts.ScriptTarget.Latest,
          true
        );

        // Collect text changes before writing the file.
        const replacements: Replacement[] = [];

        const addReplacement = (node: ts.StringLiteral) => {
          // Rewrite the module path if it points to an emitted file.
          // Only replace the text inside quotes to preserve the rest of tsc's output.
          const value = resolveModuleSpecifier({
            filepath,
            specifier: node.text,
            extensions: DECLARATION_EXTENSIONS,
            explicitExtensions: EXPLICIT_SOURCE_EXTENSIONS,
          });

          if (value !== node.text) {
            replacements.push({
              start: node.getStart(sourceFile) + 1,
              end: node.getEnd() - 1,
              value,
            });
          }
        };

        const visit = (node: ts.Node) => {
          // Find module paths in this node.
          // Cover static imports/exports and import() types.
          const specifier = getModuleSpecifier(node);

          if (specifier && !isCodegenImport(filepath, specifier.text)) {
            addReplacement(specifier);
          }

          ts.forEachChild(node, visit);
        };

        visit(sourceFile);

        if (replacements.length) {
          // Keep the source map in sync with the changed declaration file.
          const sourceMapPath = `${filepath}.map`;

          if (await fs.pathExists(sourceMapPath)) {
            await updateSourceMap({
              filepath: sourceMapPath,
              replacements,
              sourceFile,
            });
          }

          // Write the declaration file with the new module paths.
          await fs.writeFile(
            filepath,
            replacements
              // Apply edits from the end so earlier offsets stay valid.
              .sort((a, b) => b.start - a.start)
              .reduce(
                (result, replacement) =>
                  result.slice(0, replacement.start) +
                  replacement.value +
                  result.slice(replacement.end),
                code
              )
          );
        }
      });

    await Promise.all(promises);
  }
};

export default async function build({
  source,
  root,
  output,
  report,
  options,
  variants,
  esm,
}: Options) {
  report.info(
    `Cleaning up previous build at ${kleur.blue(path.relative(root, output))}`
  );

  await deleteAsync([output]);

  report.info(`Generating type definitions with ${kleur.blue('tsc')}`);

  const project = options?.project ? options.project : 'tsconfig.json';
  const tsconfig = path.join(root, project);

  try {
    if (await fs.pathExists(tsconfig)) {
      try {
        const config = JSON5.parse(await fs.readFile(tsconfig, 'utf-8'));

        if (config.compilerOptions) {
          const conflicts: string[] = [];

          if (config.compilerOptions.declarationDir) {
            conflicts.push('compilerOptions.declarationDir');
          }

          if (
            config.compilerOptions.outDir &&
            path.join(root, config.compilerOptions.outDir) !== output
          ) {
            conflicts.push('compilerOptions.outDir');
          }

          if (conflicts.length) {
            report.warn(
              `Found following options in the config file which can conflict with the CLI options. Please remove them from ${kleur.blue(
                project
              )}:${conflicts.reduce(
                (acc, curr) =>
                  acc + `\n${kleur.gray('-')} ${kleur.yellow(curr)}`,
                ''
              )}`
            );
          }
        }
      } catch (e) {
        report.warn(
          `Couldn't parse ${kleur.blue(
            project
          )}. There might be validation errors.`
        );
      }
    } else {
      throw new Error(
        `Couldn't find a ${kleur.blue(project)} in the project root.`
      );
    }

    const args = [
      '--pretty',
      '--declaration',
      '--declarationMap',
      '--noEmit',
      'false',
      '--emitDeclarationOnly',
      '--project',
      project,
    ];

    let command: string | null;

    if (options?.tsc) {
      command = path.resolve(root, options.tsc);

      if (!(await fs.pathExists(command))) {
        throw new Error(
          `The ${kleur.blue(
            'tsc'
          )} binary doesn't seem to be installed at ${kleur.blue(
            command
          )}. Please specify the correct path in options or remove it to use the workspace's version.`
        );
      }
    } else {
      try {
        const manifest = createRequire(path.join(root, 'package.json')).resolve(
          'typescript/package.json'
        );

        const { bin } = JSON.parse(await fs.readFile(manifest, 'utf-8'));

        // Run the binary with node command
        command = process.execPath;
        args.unshift(path.join(path.dirname(manifest), bin.tsc));
      } catch {
        const binary = platform() === 'win32' ? 'tsc.cmd' : 'tsc';

        command = await which(binary, { nothrow: true });

        if (command == null) {
          throw new Error(
            `The ${kleur.blue(
              'tsc'
            )} binary doesn't seem to be installed in the workspace or present in $PATH. Make sure you have added ${kleur.blue(
              'typescript'
            )} to your ${kleur.blue(
              'devDependencies'
            )} or specify the ${kleur.blue('tsc')} option for typescript.`
          );
        }

        report.warn(
          `Failed to resolve ${kleur.blue(
            'tsc'
          )} in the workspace. Falling back to the binary found in ${kleur.blue(
            'PATH'
          )} at ${kleur.blue(command)}. Consider adding ${kleur.blue(
            'typescript'
          )} to your ${kleur.blue(
            'devDependencies'
          )} or specifying the ${kleur.blue(
            'tsc'
          )} option for the typescript target.`
        );
      }
    }

    const outputs: { commonjs?: string; module?: string } = {};

    if (esm && variants.commonjs && variants.module) {
      outputs.commonjs = path.join(output, 'commonjs');
      outputs.module = path.join(output, 'module');
    } else if (variants.commonjs) {
      outputs.commonjs = output;
    } else {
      outputs.module = output;
    }

    const outDir = outputs.commonjs ?? outputs.module;

    if (outDir == null) {
      throw new Error('Neither commonjs nor module output is enabled.');
    }

    args.push('--outDir', outDir);

    const tsbuildinfo = path.join(
      outDir,
      project.replace(/\.json$/, '.tsbuildinfo')
    );

    try {
      await deleteAsync([tsbuildinfo]);
    } catch (e) {
      // Ignore
    }

    await spawn(command, args, { cwd: root });

    try {
      await deleteAsync([tsbuildinfo]);
    } catch (e) {
      // Ignore
    }

    const pkg = JSON.parse(
      await fs.readFile(path.join(root, 'package.json'), 'utf-8')
    );

    const codegenEnabled = 'codegenConfig' in pkg;

    if (esm) {
      if (outputs?.commonjs && outputs?.module) {
        // When ESM compatible output is enabled and commonjs build is present, we need to generate 2 builds for commonjs and esm
        // In this case we copy the already generated types, and add `package.json` with `type` field
        await fs.copy(outputs.commonjs, outputs.module);
        await fs.writeJSON(path.join(outputs.commonjs, 'package.json'), {
          type: 'commonjs',
        });
        await fs.writeJSON(path.join(outputs.module, 'package.json'), {
          type: 'module',
        });
      } else if (outputs?.commonjs) {
        await fs.writeJSON(path.join(outputs.commonjs, 'package.json'), {
          type: 'commonjs',
        });
      } else if (outputs?.module) {
        await fs.writeJSON(path.join(outputs.module, 'package.json'), {
          type: 'module',
        });
      }

      if (outputs.module) {
        await rewriteDeclarationImports(
          outputs.module,
          source,
          root,
          codegenEnabled
        );
      }
    }

    report.success(
      `Wrote definition files to ${kleur.blue(path.relative(root, output))}`
    );

    const fields: Field[] = [
      {
        name: 'types',
        value: pkg.types,
        output: outputs.commonjs,
        error: false,
        message: undefined,
      },
      ...(pkg.exports?.['.']?.types
        ? [
            {
              name: "exports['.'].types",
              value: pkg.exports?.['.']?.types,
              output: outDir,
              error: Boolean(
                pkg.exports?.['.']?.import && pkg.exports?.['.']?.require
              ),
              message: `using  ${kleur.blue(
                "exports['.'].import"
              )} and ${kleur.blue(
                "exports['.'].require"
              )}. Specify ${kleur.blue(
                "exports['.'].import.types"
              )} and ${kleur.blue("exports['.'].require.types")} instead.`,
            },
          ]
        : []),
      {
        name: "exports['.'].import.types",
        value: pkg.exports?.['.']?.import?.types,
        output: outputs.module,
        error: !esm,
        message: `the ${kleur.blue(
          'esm'
        )} option is not enabled for the ${kleur.blue('module')} target`,
      },
      {
        name: "exports['.'].require.types",
        value: pkg.exports?.['.']?.require?.types,
        output: outputs.commonjs,
        error: false,
        message: undefined,
      },
    ];

    const getGeneratedTypesPath = async (field: Field) => {
      if (!field.output || field.error) {
        return null;
      }

      if (pkg.source) {
        const indexDTsName =
          path.basename(pkg.source).replace(/\.(jsx?|tsx?)$/, '') + '.d.ts';

        const potentialPaths = [
          path.join(field.output, path.dirname(pkg.source), indexDTsName),
          path.join(
            field.output,
            path.relative(source, path.join(root, path.dirname(pkg.source))),
            indexDTsName
          ),
        ];

        for (const potentialPath of potentialPaths) {
          if (await fs.pathExists(potentialPath)) {
            return path.relative(root, potentialPath);
          }
        }
      }

      return null;
    };

    const invalidFieldNames = (
      await Promise.all(
        fields.map(async (field) => {
          if (field.error) {
            if (field.value) {
              report.warn(
                `The ${kleur.blue(field.name)} field in ${kleur.blue(
                  `package.json`
                )} should not be set when ${String(field.message)}.`
              );
            }

            return null;
          }

          if (
            field.name.startsWith('exports') &&
            field.value &&
            !/^\.\//.test(field.value)
          ) {
            report.error(
              `The ${kleur.blue(field.name)} field in ${kleur.blue(
                `package.json`
              )} should be a relative path starting with ${kleur.blue(
                './'
              )}. Found: ${kleur.blue(field.value)}`
            );

            return field.name;
          }

          if (
            field.value &&
            !(await fs.pathExists(path.join(root, field.value)))
          ) {
            const generatedTypesPath = await getGeneratedTypesPath(field);

            report.error(
              `The ${kleur.blue(field.name)} field in ${kleur.blue(
                'package.json'
              )} points to a non-existent file: ${kleur.blue(
                field.value
              )}.\nVerify the path points to the correct file under ${kleur.blue(
                path.relative(root, output)
              )}${
                generatedTypesPath
                  ? ` (found ${kleur.blue(generatedTypesPath)}).`
                  : '.'
              }`
            );

            return field.name;
          }

          return null;
        })
      )
    ).filter((name): name is string => name != null);

    if (invalidFieldNames.length) {
      throw new Error(
        `Found errors for fields: ${invalidFieldNames.join(', ')}.`
      );
    }

    const validFields = fields.filter((field) => !field.error);

    if (validFields.every((field) => field.value == null)) {
      const suggestedTypesPaths = (
        await Promise.all(
          validFields.map(async (field) => getGeneratedTypesPath(field))
        )
      )
        .filter((path): path is string => path != null)
        .filter((path, i, self) => self.indexOf(path) === i);

      report.warn(
        `No ${validFields
          .map((field) => kleur.blue(field.name))
          .join(' or ')} field found in ${kleur.blue(
          'package.json'
        )}. Consider ${
          suggestedTypesPaths.length
            ? `pointing to ${suggestedTypesPaths
                .map((path) => kleur.blue(path))
                .join(' or ')}`
            : `adding ${validFields.length > 1 ? 'them' : 'it'}`
        } so that consumers of your package can use the typescript definitions.`
      );
    }
  } catch (e: unknown) {
    if (e != null && typeof e === 'object') {
      if ('stdout' in e && e.stdout != null) {
        report.error(
          `Errors found when building definition files:\n${e.stdout.toString()}`
        );
      } else if ('message' in e && typeof e.message === 'string') {
        report.error(e.message);
      }
    }

    throw new Error('Failed to build definition files.', { cause: e });
  }
}

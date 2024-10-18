import kleur from 'kleur';
import path from 'path';
import fs from 'fs-extra';
import which from 'which';
import spawn from 'cross-spawn';
import del from 'del';
import JSON5 from 'json5';
import { platform } from 'os';
import type { Input } from '../types';

type Options = Input & {
  options?: {
    esm?: boolean;
    project?: string;
    tsc?: string;
  };
  clean: boolean;
};

type Field = {
  name: string;
  value: string | undefined;
  output: string | undefined;
  error: boolean;
};

export default async function build({
  clean,
  root,
  source,
  output,
  report,
  options,
}: Options) {
  if (clean) {
    report.info(
      `Cleaning up previous build at ${kleur.blue(path.relative(root, output))}`
    );

    await del([output]);
  }

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
          `Couldn't parse '${project}'. There might be validation errors.`
        );
      }
    } else {
      throw new Error(
        `Couldn't find a ${kleur.blue('tsconfig.json')} in the project root.`
      );
    }

    let tsc;

    if (options?.tsc) {
      tsc = path.resolve(root, options.tsc);

      if (!(await fs.pathExists(tsc))) {
        throw new Error(
          `The ${kleur.blue(
            'tsc'
          )} binary doesn't seem to be installed at ${kleur.blue(
            tsc
          )}. Please specify the correct path in options or remove it to use the workspace's version.`
        );
      }
    } else {
      const execpath = process.env.npm_execpath;
      const cli = execpath?.split('/').pop()?.includes('yarn') ? 'yarn' : 'npm';

      if (cli === 'yarn') {
        const result = spawn.sync('yarn', ['bin', 'tsc'], {
          stdio: 'pipe',
          encoding: 'utf-8',
          cwd: root,
        });

        tsc = result.stdout.trim();
      } else {
        tsc = path.resolve(root, 'node_modules', '.bin', 'tsc');
      }

      if (platform() === 'win32' && !tsc.endsWith('.cmd')) {
        tsc += '.cmd';
      }
    }

    if (!(await fs.pathExists(tsc))) {
      try {
        tsc = await which('tsc');

        if (await fs.pathExists(tsc)) {
          report.warn(
            `Failed to locate ${kleur.blue(
              'tsc'
            )} in the workspace. Falling back to the binary found in ${kleur.blue(
              'PATH'
            )} at ${kleur.blue(tsc)}. Consider adding ${kleur.blue(
              'typescript'
            )} to your ${kleur.blue(
              'devDependencies'
            )} or specifying the ${kleur.blue(
              'tsc'
            )} option for the typescript target.`
          );
        }
      } catch (e) {
        // Ignore
      }
    }

    if (tsc == null || !(await fs.pathExists(tsc))) {
      throw new Error(
        `The ${kleur.blue(
          'tsc'
        )} binary doesn't seem to be installed under ${kleur.blue(
          'node_modules'
        )} or present in $PATH. Make sure you have added ${kleur.blue(
          'typescript'
        )} to your ${kleur.blue('devDependencies')} or specify the ${kleur.blue(
          'tsc'
        )} option for typescript.`
      );
    }

    const tsbuildinfo = path.join(
      output,
      project.replace(/\.json$/, '.tsbuildinfo')
    );

    try {
      await del([tsbuildinfo]);
    } catch (e) {
      // Ignore
    }

    const outputs = options?.esm
      ? {
          commonjs: path.join(output, 'commonjs'),
          module: path.join(output, 'module'),
        }
      : { commonjs: output };

    const result = spawn.sync(
      tsc,
      [
        '--pretty',
        '--declaration',
        '--declarationMap',
        '--noEmit',
        'false',
        '--emitDeclarationOnly',
        '--project',
        project,
        '--outDir',
        outputs.commonjs,
      ],
      {
        stdio: 'inherit',
        cwd: root,
      }
    );

    if (result.status === 0) {
      await del([tsbuildinfo]);

      if (outputs?.module) {
        // When ESM compatible output is enabled, we need to generate 2 builds for commonjs and esm
        // In this case we copy the already generated types, and add `package.json` with `type` field
        await fs.copy(outputs.commonjs, outputs.module);
        await fs.writeJSON(path.join(outputs.commonjs, 'package.json'), {
          type: 'commonjs',
        });
        await fs.writeJSON(path.join(outputs.module, 'package.json'), {
          type: 'module',
        });
      }

      report.success(
        `Wrote definition files to ${kleur.blue(path.relative(root, output))}`
      );

      const pkg = JSON.parse(
        await fs.readFile(path.join(root, 'package.json'), 'utf-8')
      );

      const fields: Field[] = [
        {
          name: 'types',
          value: pkg.types,
          output: outputs.commonjs,
          error: false,
        },
        ...(pkg.exports?.['.']?.types
          ? [
              {
                name: "exports['.'].types",
                value: pkg.exports?.['.']?.types,
                output: outputs.commonjs,
                error: options?.esm === true,
              },
            ]
          : []),
        {
          name: "exports['.'].import.types",
          value: pkg.exports?.['.']?.import?.types,
          output: outputs.module,
          error: !options?.esm,
        },
        {
          name: "exports['.'].require.types",
          value: pkg.exports?.['.']?.require?.types,
          output: outputs.commonjs,
          error: !options?.esm,
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
                  )} should not be set when the ${kleur.blue(
                    'esm'
                  )} option is ${options?.esm ? 'enabled' : 'disabled'}.`
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
            validFields.map((field) => getGeneratedTypesPath(field))
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
    } else {
      throw new Error('Failed to build definition files.');
    }
  } catch (e: unknown) {
    if (e != null && typeof e === 'object') {
      if ('stdout' in e && e.stdout != null) {
        report.error(
          `Errors found when building definition files:\n${e.stdout.toString()}`
        );
      } else if ('message' in e && typeof e.message === 'string') {
        report.error(e.message);
      } else {
        throw e;
      }
    } else {
      throw e;
    }

    throw new Error('Failed to build definition files.');
  }
}

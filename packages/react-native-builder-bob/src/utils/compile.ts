import path from 'path';
import fs from 'fs-extra';
import kleur from 'kleur';
import * as babel from '@babel/core';
import { globSync } from 'glob';
import type { Input, Variants } from '../types';
import { isCodegenSpec } from './isCodegenSpec';

export type CompileOptions = {
  esm?: boolean;
  babelrc?: boolean | null;
  configFile?: string | false | null;
  sourceMaps?: boolean;
  copyFlow?: boolean;
  jsxRuntime?: 'automatic' | 'classic';
};

type Options = Input &
  CompileOptions & {
    modules: 'commonjs' | 'preserve';
    variants: Variants;
    exclude: string;
  };

const sourceExt = /\.([cm])?[jt]sx?$/;

export default async function compile({
  root,
  source,
  output,
  esm = false,
  babelrc = false,
  configFile = false,
  exclude,
  modules,
  copyFlow,
  sourceMaps = true,
  report,
  jsxRuntime = 'automatic',
  variants,
}: Options) {
  const files = globSync('**/*', {
    cwd: source,
    absolute: true,
    nodir: true,
    ignore: exclude,
  });

  report.info(
    `Compiling ${kleur.blue(String(files.length))} files in ${kleur.blue(
      path.relative(root, source)
    )} with ${kleur.blue('babel')}`
  );

  const pkg = JSON.parse(
    await fs.readFile(path.join(root, 'package.json'), 'utf-8')
  );

  if (copyFlow) {
    if (!Object.keys(pkg.devDependencies || {}).includes('flow-bin')) {
      report.warn(
        `The ${kleur.blue(
          'copyFlow'
        )} option was specified, but couldn't find ${kleur.blue(
          'flow-bin'
        )} in ${kleur.blue(
          'package.json'
        )}.\nIf the project is using ${kleur.blue(
          'flow'
        )}, then make sure you have added ${kleur.blue(
          'flow-bin'
        )} to your ${kleur.blue(
          'devDependencies'
        )}, otherwise remove the ${kleur.blue('copyFlow')} option.`
      );
    }
  }

  await fs.mkdirp(output);

  // Imports are not rewritten to include the extension if `esm` is not enabled
  // Ideally we should always treat ESM syntax as CommonJS if `esm` is not enabled
  // This would maintain compatibility for legacy setups where `import`/`export` didn't require file extensions
  // However NextJS has non-standard behavior and breaks if we add `type: 'commonjs'` for code with import/export
  // So we skip generating `package.json` if `esm` is not enabled and `modules` is not `commonjs`
  // This means that user can't use `type: 'module'` in root `package.json` without enabling `esm` for `module` target
  if (esm || modules === 'commonjs') {
    await fs.writeJSON(path.join(output, 'package.json'), {
      type: modules === 'commonjs' ? 'commonjs' : 'module',
    });
  }

  await Promise.all(
    files.map(async (filepath) => {
      const outputFilename = path
        .join(output, path.relative(source, filepath))
        .replace(sourceExt, '.$1js');

      await fs.mkdirp(path.dirname(outputFilename));

      if (!sourceExt.test(filepath)) {
        // Copy files which aren't source code
        await fs.copy(filepath, outputFilename);
        return;
      }

      const content = await fs.readFile(filepath, 'utf-8');

      // If codegen is used in the app, then we need to preserve TypeScript source
      // So we copy the file as is instead of transforming it
      const codegenEnabled = 'codegenConfig' in pkg;

      if (codegenEnabled && isCodegenSpec(filepath)) {
        await fs.copy(
          filepath,
          path.join(output, path.relative(source, filepath))
        );
        return;
      }

      const result = await babel.transformAsync(content, {
        caller: {
          name: 'react-native-builder-bob',
          supportsStaticESM:
            /\.m[jt]s$/.test(filepath) || // If a file is explicitly marked as ESM, then preserve the syntax
            modules === 'preserve'
              ? true
              : false,
          rewriteImportExtensions: esm,
          jsxRuntime,
          codegenEnabled,
        },
        cwd: root,
        babelrc: babelrc,
        configFile: configFile,
        sourceMaps,
        sourceRoot: path.relative(path.dirname(outputFilename), source),
        sourceFileName: path.relative(source, filepath),
        filename: filepath,
        ...(babelrc || configFile
          ? null
          : {
              presets: [require.resolve('../../babel-preset')],
            }),
      });

      if (result == null) {
        throw new Error('Output code was null');
      }

      let code = result.code || '';

      if (sourceMaps && result.map) {
        const mapFilename = outputFilename + '.map';

        code += '\n//# sourceMappingURL=' + path.basename(mapFilename);

        // Don't inline the source code, it can be retrieved from the source file
        result.map.sourcesContent = undefined;

        await fs.writeJSON(mapFilename, result.map);
      }

      await fs.writeFile(outputFilename, code);

      if (copyFlow) {
        await fs.copy(filepath, outputFilename + '.flow');
      }
    })
  );

  report.success(`Wrote files to ${kleur.blue(path.relative(root, output))}`);

  const getGeneratedEntryPath = async () => {
    if (pkg.source) {
      for (const ext of ['.js', '.cjs', '.mjs']) {
        const indexName =
          // The source field may not have an extension, so we add it instead of replacing directly
          path.basename(pkg.source).replace(sourceExt, '') + ext;

        const potentialPath = path.join(
          output,
          path.dirname(path.relative(source, path.join(root, pkg.source))),
          indexName
        );

        if (await fs.pathExists(potentialPath)) {
          return path.relative(root, potentialPath);
        }
      }
    }

    return null;
  };

  const fields: { name: string; value: string | undefined }[] = [];

  if (variants.commonjs && variants.module) {
    if (modules === 'commonjs') {
      fields.push({ name: 'main', value: pkg.main });
    } else {
      fields.push({ name: 'module', value: pkg.module });
    }
  } else {
    fields.push({ name: 'main', value: pkg.main });
  }

  if (esm) {
    if (variants.commonjs && variants.module) {
      if (modules === 'commonjs') {
        fields.push(
          typeof pkg.exports?.['.']?.require === 'string'
            ? {
                name: "exports['.'].require",
                value: pkg.exports?.['.']?.require,
              }
            : {
                name: "exports['.'].require.default",
                value: pkg.exports?.['.']?.require?.default,
              }
        );
      } else {
        fields.push(
          typeof pkg.exports?.['.']?.import === 'string'
            ? {
                name: "exports['.'].import",
                value: pkg.exports?.['.']?.import,
              }
            : {
                name: "exports['.'].import.default",
                value: pkg.exports?.['.']?.import?.default,
              }
        );
      }
    } else {
      fields.push({
        name: "exports['.'].default",
        value: pkg.exports?.['.']?.default,
      });
    }
  } else {
    if (modules === 'commonjs' && pkg.exports?.['.']?.require) {
      report.warn(
        `The ${kleur.blue('esm')} option is disabled, but the ${kleur.blue(
          "exports['.'].require"
        )} field is set in ${kleur.blue(
          'package.json'
        )}. This is likely a mistake.`
      );
    } else if (modules === 'preserve' && pkg.exports?.['.']?.import) {
      report.warn(
        `The ${kleur.blue('esm')} option is disabled, but the ${kleur.blue(
          "exports['.'].import"
        )} field is set in ${kleur.blue(
          'package.json'
        )}. This is likely a mistake.`
      );
    }
  }

  const generatedEntryPath = await getGeneratedEntryPath();

  if (fields.some((field) => field.value)) {
    for (const { name, value } of fields) {
      if (!value) {
        continue;
      }

      if (name.startsWith('exports') && value && !/^\.\//.test(value)) {
        report.error(
          `The ${kleur.blue(name)} field in ${kleur.blue(
            `package.json`
          )} should be a relative path starting with ${kleur.blue(
            './'
          )}. Found: ${kleur.blue(value)}`
        );

        throw new Error(`Found incorrect path in '${name}' field.`);
      }

      try {
        require.resolve(path.join(root, value));
      } catch (e: unknown) {
        if (
          e != null &&
          typeof e === 'object' &&
          'code' in e &&
          e.code === 'MODULE_NOT_FOUND'
        ) {
          if (!generatedEntryPath) {
            report.warn(
              `Failed to detect the entry point for the generated files. Make sure you have a valid ${kleur.blue(
                'source'
              )} field in your ${kleur.blue('package.json')}.`
            );
          }

          report.error(
            `The ${kleur.blue(name)} field in ${kleur.blue(
              'package.json'
            )} points to a non-existent file: ${kleur.blue(
              value
            )}.\nVerify the path points to the correct file under ${kleur.blue(
              path.relative(root, output)
            )}${
              generatedEntryPath
                ? ` (found ${kleur.blue(generatedEntryPath)}).`
                : '.'
            }`
          );

          throw new Error(`Found incorrect path in '${name}' field.`, {
            cause: e,
          });
        }

        throw e;
      }
    }

    if (generatedEntryPath) {
      if (
        modules === 'commonjs' &&
        pkg.exports?.['.']?.import === `./${generatedEntryPath}`
      ) {
        report.warn(
          `The the ${kleur.blue(
            "exports['.'].import"
          )} field points to a CommonJS module. This is likely a mistake.`
        );
      } else if (
        modules === 'preserve' &&
        pkg.exports?.['.']?.require === `./${generatedEntryPath}`
      ) {
        report.warn(
          `The the ${kleur.blue(
            "exports['.'].import"
          )} field points to a ES module. This is likely a mistake.`
        );
      }
    }
  } else {
    report.warn(
      `No ${fields
        .map((field) => kleur.blue(field.name))
        .join(' or ')} field found in ${kleur.blue('package.json')}. Consider ${
        generatedEntryPath
          ? `pointing to ${kleur.blue(generatedEntryPath)}`
          : `adding ${fields.length > 1 ? 'them' : 'it'}`
      } so that consumers of your package can import your package.`
    );
  }
}

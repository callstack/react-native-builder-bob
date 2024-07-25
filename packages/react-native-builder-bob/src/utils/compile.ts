import path from 'path';
import fs from 'fs-extra';
import kleur from 'kleur';
import * as babel from '@babel/core';
import glob from 'glob';
import type { Input } from '../types';

type Options = Input & {
  esm?: boolean;
  babelrc?: boolean | null;
  configFile?: string | false | null;
  sourceMaps?: boolean;
  copyFlow?: boolean;
  modules: 'commonjs' | 'preserve';
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
}: Options) {
  const files = glob.sync('**/*', {
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
  await fs.writeJSON(path.join(output, 'package.json'), {
    type: modules === 'commonjs' ? 'commonjs' : 'module',
  });

  await Promise.all(
    files.map(async (filepath) => {
      const outputFilename = path
        .join(output, path.relative(source, filepath))
        .replace(sourceExt, '.$1js');

      await fs.mkdirp(path.dirname(outputFilename));

      if (!sourceExt.test(filepath)) {
        // Copy files which aren't source code
        fs.copy(filepath, outputFilename);
        return;
      }

      const content = await fs.readFile(filepath, 'utf-8');
      const result = await babel.transformAsync(content, {
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
              presets: [
                [
                  require.resolve('../../babel-preset'),
                  {
                    modules:
                      // If a file is explicitly marked as ESM, then preserve the syntax
                      /\.m[jt]s$/.test(filepath) ? 'preserve' : modules,
                    esm,
                  },
                ],
              ],
            }),
      });

      if (result == null) {
        throw new Error('Output code was null');
      }

      let code = result.code;

      if (sourceMaps && result.map) {
        const mapFilename = outputFilename + '.map';

        code += '\n//# sourceMappingURL=' + path.basename(mapFilename);

        // Don't inline the source code, it can be retrieved from the source file
        result.map.sourcesContent = undefined;

        await fs.writeJSON(mapFilename, result.map);
      }

      await fs.writeFile(outputFilename, code);

      if (copyFlow) {
        fs.copy(filepath, outputFilename + '.flow');
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

  const fields =
    modules === 'commonjs'
      ? [{ name: 'main', value: pkg.main }]
      : [{ name: 'module', value: pkg.module }];

  if (esm) {
    if (modules === 'commonjs') {
      fields.push({
        name: "exports['.'].require",
        value: pkg.exports?.['.']?.require,
      });
    } else {
      fields.push({
        name: "exports['.'].import",
        value: pkg.exports?.['.']?.import,
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

  if (fields.some((field) => field.value)) {
    await Promise.all(
      fields.map(async ({ name, value }) => {
        if (!value) {
          return;
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
            const generatedEntryPath = await getGeneratedEntryPath();

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

            throw new Error(`Found incorrect path in '${name}' field.`);
          }

          throw e;
        }
      })
    );
  } else {
    const generatedEntryPath = await getGeneratedEntryPath();

    report.warn(
      `No ${kleur.blue(
        fields.map((field) => field.name).join(' or ')
      )} field found in ${kleur.blue('package.json')}. Consider ${
        generatedEntryPath
          ? `pointing it to ${kleur.blue(generatedEntryPath)}`
          : 'adding it'
      } so that consumers of your package can use it.`
    );
  }
}

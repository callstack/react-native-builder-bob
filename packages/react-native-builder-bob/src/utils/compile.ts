import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';
import * as babel from '@babel/core';
import browserslist from 'browserslist';
import glob from 'glob';
import { watch } from 'chokidar';
import type { Input } from '../types';
import * as logger from './logger';
import { debounce } from './debounce';

type Options = Input & {
  babelrc?: boolean | null | undefined;
  configFile?: string | false | null | undefined;
  modules: 'commonjs' | false;
  copyFlow: boolean | undefined;
};

export async function compileFiles(
  files: string[],
  {
    root,
    source,
    output,
    babelrc = false,
    configFile = false,
    modules,
    copyFlow,
    report,
  }: Options
) {
  report.info(
    `Compiling ${chalk.blue(String(files.length))} files in ${chalk.blue(
      path.relative(root, source)
    )} with ${chalk.blue('babel')}`
  );

  await Promise.all(
    files.map(async (filepath) => {
      const outputFilename = path
        .join(output, path.relative(source, filepath))
        .replace(/\.(jsx?|tsx?)$/, '.js');

      await fs.mkdirp(path.dirname(outputFilename));

      if (!/\.(jsx?|tsx?)$/.test(filepath)) {
        // Copy files which aren't source code
        fs.copy(filepath, outputFilename);
        return;
      }

      const content = await fs.readFile(filepath, 'utf-8');
      const result = await babel.transformAsync(content, {
        babelrc: babelrc,
        configFile: configFile,
        sourceMaps: true,
        filename: filepath,
        ...(babelrc || configFile
          ? null
          : {
              presets: [
                [
                  require.resolve('@babel/preset-env'),
                  {
                    // @ts-ignore
                    targets: browserslist.findConfig(root) ?? {
                      browsers: [
                        '>1%',
                        'last 2 chrome versions',
                        'last 2 edge versions',
                        'last 2 firefox versions',
                        'last 2 safari versions',
                        'not dead',
                        'not ie <= 11',
                        'not op_mini all',
                        'not android <= 4.4',
                        'not samsung <= 4',
                      ],
                      node: '10',
                    },
                    useBuiltIns: false,
                    modules,
                  },
                ],
                require.resolve('@babel/preset-react'),
                require.resolve('@babel/preset-typescript'),
                require.resolve('@babel/preset-flow'),
              ],
              plugins: [
                require.resolve('@babel/plugin-proposal-class-properties'),
              ],
            }),
      });

      if (result == null) {
        throw new Error('Output code was null');
      }

      let code = result.code;

      if (result.map) {
        const mapFilename = outputFilename + '.map';
        code += '\n//# sourceMappingURL=' + path.basename(mapFilename);

        fs.writeFileSync(mapFilename, JSON.stringify(result.map));
      }

      await fs.writeFile(outputFilename, code);

      if (copyFlow) {
        fs.copy(filepath, outputFilename + '.flow');
      }
    })
  );

  report.success(`Wrote files to ${chalk.blue(path.relative(root, output))}`);
}

export default async function compile(options: Options) {
  const files = glob.sync('**/*', {
    cwd: options.source,
    absolute: true,
    nodir: true,
    ignore: '**/{__tests__,__fixtures__,__mocks__}/**',
  });

  await compileFiles(files, options);

  if (options.watch) {
    logger.info('Watching for changes...');
    const watcher = watch(options.source, {
      ignored: /.*\/?__(tests|fixtures|mocks)__\/.*/,
    });

    let paths: string[] = [];
    const debouncedCompile = debounce(() => {
      compileFiles(paths, options);
      paths = [];
    }, 250);

    watcher.on('change', async (path) => {
      if (!path) return;

      paths.push(path);

      debouncedCompile(paths);
    });
  }
}

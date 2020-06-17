import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';
import * as babel from '@babel/core';
import browserslist from 'browserslist';
import glob from 'glob';
import type { Input } from '../types';

type Options = Input & {
  babelrc?: boolean | null | undefined;
  configFile?: string | false | null | undefined;
  modules: 'commonjs' | false;
  copyFlow: boolean | undefined;
};

export default async function compile({
  root,
  source,
  output,
  babelrc = false,
  configFile = false,
  modules,
  copyFlow,
  report,
}: Options) {
  const files = glob.sync('**/*', {
    cwd: source,
    absolute: true,
    nodir: true,
    ignore: '**/{__tests__,__fixtures__,__mocks__}/**',
  });

  report.info(
    `Compiling ${chalk.blue(String(files.length))} files in ${chalk.blue(
      path.relative(root, source)
    )} with ${chalk.blue('babel')}`
  );

  await Promise.all(
    files.map(async (filepath) => {
      const outputFilename = path
        .join(output, path.relative(source, filepath))
        .replace(/\.(js|tsx?)$/, '.js');

      await fs.mkdirp(path.dirname(outputFilename));

      if (!/\.(js|tsx?)$/.test(filepath)) {
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

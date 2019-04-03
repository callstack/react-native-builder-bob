import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';
import * as babel from '@babel/core';
import glob from 'glob';
import { Input } from '../types';

type Options = Input & {
  options: babel.TransformOptions;
  flow: boolean;
};

export default async function compile({
  root,
  source,
  output,
  options,
  flow,
  report,
}: Options) {
  const files = glob.sync('**/*', {
    cwd: source,
    absolute: true,
    nodir: true,
    ignore: '**/__tests__/**,**/__fixtures__/**',
  });

  report.info(
    `Compiling ${chalk.blue(String(files.length))} files in ${chalk.blue(
      path.relative(root, source)
    )} with ${chalk.blue('babel')}`
  );

  await Promise.all(
    files.map(async filepath => {
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
        babelrc: false,
        configFile: false,
        sourceMaps: true,
        filename: filepath,
        ...options,
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

      if (flow) {
        fs.copy(filepath, outputFilename + '.flow');
      }
    })
  );

  report.success(`Wrote files to ${chalk.blue(path.relative(root, output))}`);
}

import path from 'path';
import fs from 'fs-extra';
import * as babel from '@babel/core';
import glob from 'glob';
import { Input } from '../types';
import * as logger from './logger';

type Options = Input & {
  options: babel.TransformOptions;
  flow: boolean,
};

export default async function compile({
  root,
  source,
  output,
  options,
  flow
}: Options) {
  const files = glob.sync('**/*', {
    cwd: source,
    absolute: true,
    ignore: '**/__tests__/**,**/__fixtures__/**',
  });

  await Promise.all(
    files.map(async filepath => {
      const outputFilename = path
        .join(output, path.relative(source, filepath))
        .replace(/\.(js|tsx?)/, '.js');

      await fs.mkdirp(path.dirname(outputFilename));

      if (!/\.(js|tsx?)/.test(filepath)) {
        // Copy files which aren't source code
        fs.copy(filepath, outputFilename, { overwrite: true });
      }

      const content = await fs.readFile(filepath, 'utf-8');
      const result = await babel.transformAsync(content, {
        babelrc: false,
        configFile: false,
        sourceMaps: true,
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

      // If the code has flow comment, also copy the file for flow
      if (flow && content.includes('@flow')) {
        fs.copy(filepath, outputFilename + '.flow', { overwrite: true });
      }
    })
  );

  logger.info(`built ${files.length} files in ${path.relative(root, source)} to ${path.relative(root, output)}`);
}

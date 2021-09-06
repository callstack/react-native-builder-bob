import path from 'path';
import chalk from 'chalk';
import { cosmiconfigSync } from 'cosmiconfig';
import buildAAR from './targets/aar';
import buildCommonJS from './targets/commonjs';
import buildModule from './targets/module';
import buildTypescript from './targets/typescript';
import type {
  AARTargetOptions,
  CJSTargetOptions,
  ModuleTargetOptions,
  Options,
  TSTargetOptions,
} from './types';
import * as logger from './utils/logger';

const { name } = require('../package.json'); // eslint-disable-line import/no-commonjs

const explorer = cosmiconfigSync(name, {
  searchPlaces: ['package.json', `bob.config.js`],
});

type In = {
  argv: Record<string, any>;
  root: string;
  watch?: boolean;
};

export const build = async ({ argv, root, watch }: In) => {
  const result = explorer.search();

  if (!result?.config) {
    logger.exit(
      `No configuration found. Run '${argv.$0} init' to create one automatically.`
    );
  }

  const options: Options = result!.config;

  if (!options.targets?.length) {
    logger.exit(
      `No targets found in the configuration in '${path.relative(
        root,
        result!.filepath
      )}'.`
    );
  }

  const source = options.source;

  if (!source) {
    logger.exit(
      `No source option found in the configuration in '${path.relative(
        root,
        result!.filepath
      )}'.`
    );
  }

  const output = options.output;

  if (!output) {
    logger.exit(
      `No source option found in the configuration in '${path.relative(
        root,
        result!.filepath
      )}'.`
    );
  }

  const report = {
    info: logger.info,
    warn: logger.warn,
    error: logger.error,
    success: logger.success,
  };

  for (const target of options.targets!) {
    const targetName = Array.isArray(target) ? target[0] : target;
    const targetOptions = Array.isArray(target) ? target[1] : {};

    report.info(`Building target ${chalk.blue(targetName)}`);

    switch (targetName) {
      case 'aar':
        await buildAAR({
          root,
          source: path.resolve(root, source as string),
          output: path.resolve(root, output as string, 'aar'),
          options: targetOptions as Partial<AARTargetOptions>,
          report,
        });
        break;
      case 'commonjs':
        await buildCommonJS({
          root,
          source: path.resolve(root, source as string),
          output: path.resolve(root, output as string, 'commonjs'),
          options: targetOptions as CJSTargetOptions,
          report,
          watch,
        });
        break;
      case 'module':
        await buildModule({
          root,
          source: path.resolve(root, source as string),
          output: path.resolve(root, output as string, 'module'),
          options: targetOptions as ModuleTargetOptions,
          report,
          watch,
        });
        break;
      case 'typescript':
        await buildTypescript({
          root,
          source: path.resolve(root, source as string),
          output: path.resolve(root, output as string, 'typescript'),
          options: targetOptions as TSTargetOptions,
          report,
          watch,
        });
        break;
      default:
        logger.exit(`Invalid target ${chalk.blue(targetName)}.`);
    }
  }
};

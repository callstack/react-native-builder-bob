import path from 'path';
import kleur from 'kleur';
import * as logger from './utils/logger';
import buildCommonJS from './targets/commonjs';
import buildModule from './targets/module';
import buildTypescript from './targets/typescript';
import buildCodegen from './targets/codegen';
import customTarget from './targets/custom';
import { type Options, type Target } from './types';
import fs from 'fs-extra';
import { loadConfig } from './utils/loadConfig';
import yargs from 'yargs';

export const args = {
  target: {
    type: 'string',
    description: 'The target to build',
    choices: ['commonjs', 'module', 'typescript', 'codegen'] satisfies Target[],
  },
} satisfies Record<'target', yargs.Options>;

type Argv = {
  $0: string;
  target?: Target;
};

export async function build(argv: Argv) {
  const root = process.cwd();

  const projectPackagePath = path.resolve(root, 'package.json');

  if (!(await fs.pathExists(projectPackagePath))) {
    throw new Error(
      `Couldn't find a 'package.json' file in '${root}'. Are you in a project folder?`
    );
  }

  const result = await loadConfig();

  if (!result?.config) {
    logger.error(
      `No configuration found. Run '${argv.$0} init' to create one automatically.`
    );
    process.exit(1);
  }

  const options: Options = result!.config;

  if (!options.targets?.length) {
    logger.error(
      `No targets found in the configuration in '${path.relative(
        root,
        result!.filepath
      )}'.`
    );
    process.exit(1);
  }

  const source = options.source;

  if (!source) {
    logger.error(
      `No source option found in the configuration in '${path.relative(
        root,
        result!.filepath
      )}'.`
    );
    process.exit(1);
  }

  const output = options.output;

  if (!output) {
    logger.error(
      `No source option found in the configuration in '${path.relative(
        root,
        result!.filepath
      )}'.`
    );
    process.exit(1);
  }

  const exclude = options.exclude ?? '**/{__tests__,__fixtures__,__mocks__}/**';

  const commonjs = options.targets?.some((t) =>
    Array.isArray(t) ? t[0] === 'commonjs' : t === 'commonjs'
  );

  const module = options.targets?.some((t) =>
    Array.isArray(t) ? t[0] === 'module' : t === 'module'
  );

  const variants = {
    commonjs,
    module,
  };

  if (argv.target != null) {
    buildTarget({
      root,
      target: argv.target,
      source,
      output,
      exclude,
      options,
      variants,
    });
  } else {
    for (const target of options.targets!) {
      buildTarget({
        root,
        target,
        source,
        output,
        exclude,
        options,
        variants,
      });
    }
  }
}

async function buildTarget({
  root,
  target,
  source,
  output,
  exclude,
  options,
  variants,
}: {
  root: string;
  target: Exclude<Options['targets'], undefined>[number];
  source: string;
  output: string;
  exclude: string;
  options: Options;
  variants: {
    commonjs?: boolean;
    module?: boolean;
  };
}) {
  const targetName = Array.isArray(target) ? target[0] : target;
  const targetOptions = Array.isArray(target) ? target[1] : undefined;

  const report = logger.grouped(targetName);

  switch (targetName) {
    case 'commonjs':
      await buildCommonJS({
        root,
        source: path.resolve(root, source),
        output: path.resolve(root, output, 'commonjs'),
        exclude,
        options: targetOptions,
        variants,
        report,
      });
      break;
    case 'module':
      await buildModule({
        root,
        source: path.resolve(root, source),
        output: path.resolve(root, output, 'module'),
        exclude,
        options: targetOptions,
        variants,
        report,
      });
      break;
    case 'typescript':
      {
        const esm =
          options.targets?.some((t) => {
            if (Array.isArray(t)) {
              const [name, options] = t;

              if (name === 'module') {
                return options && 'esm' in options && options?.esm;
              }
            }

            return false;
          }) ?? false;

        await buildTypescript({
          root,
          source: path.resolve(root, source),
          output: path.resolve(root, output, 'typescript'),
          options: targetOptions,
          esm,
          variants,
          report,
        });
      }
      break;
    case 'codegen':
      await buildCodegen({
        root,
        source: path.resolve(root, source),
        output: path.resolve(root, output, 'typescript'),
        report,
      });
      break;
    case 'custom':
      await customTarget({
        options: targetOptions,
        source: path.resolve(root, source),
        report,
        root,
      });
      break;
    default:
      logger.error(`Invalid target ${kleur.blue(targetName)}.`);
      process.exit(1);
  }
}

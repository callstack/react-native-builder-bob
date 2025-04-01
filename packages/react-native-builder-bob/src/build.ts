import fs from 'fs-extra';
import kleur from 'kleur';
import path from 'path';
import yargs from 'yargs';
import { type Options, type Target } from './types';
import { loadConfig } from './utils/loadConfig';
import * as logger from './utils/logger';
import { run } from './utils/workerize';

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

  const result = loadConfig(root);

  if (!result?.config) {
    throw new Error(
      `No configuration found. Run '${argv.$0} init' to create one automatically.`
    );
  }

  const options: Options = result!.config;

  if (!options.targets?.length) {
    throw new Error(
      `No 'targets' found in the configuration in '${path.relative(
        root,
        result!.filepath
      )}'.`
    );
  }

  const source = options.source;

  if (!source) {
    throw new Error(
      `No 'source' option found in the configuration in '${path.relative(
        root,
        result!.filepath
      )}'.`
    );
  }

  const output = options.output;

  if (!output) {
    throw new Error(
      `No 'output' option found in the configuration in '${path.relative(
        root,
        result!.filepath
      )}'.`
    );
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
    case 'module':
      await run(targetName, {
        root,
        source: path.resolve(root, source),
        output: path.resolve(root, output, targetName),
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

        await run('typescript', {
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
      await run('codegen', {
        root,
        source: path.resolve(root, source),
        output: path.resolve(root, output, 'typescript'),
        report,
      });
      break;
    case 'custom':
      await run('custom', {
        options: targetOptions,
        source: path.resolve(root, source),
        report,
        root,
      });
      break;
    default:
      throw new Error(`Invalid target ${kleur.blue(targetName)}.`);
  }
}

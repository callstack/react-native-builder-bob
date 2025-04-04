import { type } from 'arktype';
import fs from 'fs-extra';
import kleur from 'kleur';
import path from 'path';
import yargs from 'yargs';
import { config, type Config, type Target, type TargetOptions } from './schema';
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

  const parsed = config(result.config);

  if (parsed instanceof type.errors) {
    throw new Error(
      `Invalid configuration in ${result.filepath}: ${parsed.summary}`
    );
  }

  const { source, output, targets, exclude } = parsed;

  const commonjs = targets.some((t) =>
    Array.isArray(t) ? t[0] === 'commonjs' : t === 'commonjs'
  );

  const module = targets.some((t) =>
    Array.isArray(t) ? t[0] === 'module' : t === 'module'
  );

  const variants = {
    commonjs,
    module,
  };

  if (argv.target != null) {
    await buildTarget({
      root,
      target: argv.target,
      source,
      output,
      exclude,
      config: parsed,
      variants,
    });
  } else {
    await Promise.all(
      targets.map((target) =>
        buildTarget({
          root,
          target: Array.isArray(target) ? target[0] : target,
          source,
          output,
          exclude,
          config: parsed,
          variants,
        })
      )
    );
  }
}

async function buildTarget<T extends Target>({
  root,
  target,
  source,
  output,
  exclude,
  config,
  variants,
}: {
  root: string;
  target: T;
  source: string;
  output: string;
  exclude: string;
  config: Config;
  variants: {
    commonjs?: boolean;
    module?: boolean;
  };
}) {
  const options = config.targets
    .map((t) => (Array.isArray(t) ? t : ([t, undefined] as const)))
    .find((t) => t[0] === target)?.[1];

  const report = logger.grouped(target);

  switch (target) {
    case 'commonjs':
    case 'module':
      await run(target, {
        root,
        source: path.resolve(root, source),
        output: path.resolve(root, output, target),
        exclude,
        options: options as TargetOptions<'commonjs' | 'module'>,
        variants,
        report,
      });
      break;
    case 'typescript':
      {
        const esm =
          config.targets?.some((t) => {
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
          options: options as TargetOptions<'typescript'>,
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
        report,
      });
      break;
    case 'custom':
      await run('custom', {
        root,
        source: path.resolve(root, source),
        options: options as TargetOptions<'custom'>,
        report,
      });
      break;
    default:
      throw new Error(`Invalid target ${kleur.blue(target)}.`);
  }
}

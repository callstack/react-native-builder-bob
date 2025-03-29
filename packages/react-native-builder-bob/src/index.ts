import yargs from 'yargs';
import { build } from './build';
import { init } from './init';
import type { Target } from './schema';

type ArgName = 'target';

const args = {
  target: {
    type: 'string',
    description: 'The target to build',
    choices: ['commonjs', 'module', 'typescript', 'codegen'] satisfies Target[],
  },
} satisfies Record<ArgName, yargs.Options>;

// eslint-disable-next-line @typescript-eslint/no-unused-expressions
yargs
  .command('init', 'configure the package to use bob', {}, init)
  .command('build', 'build files for publishing', args, build)
  .demandCommand()
  .recommendCommands()
  .strict().argv;

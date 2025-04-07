import yargs, { type Options } from 'yargs';
import { hideBin } from 'yargs/helpers';
import { build } from './build.ts';
import { init } from './init.ts';
import type { Target } from './schema.ts';

type ArgName = 'target';

const args = {
  target: {
    type: 'string',
    description: 'The target to build',
    choices: ['commonjs', 'module', 'typescript', 'codegen'] satisfies Target[],
  },
} satisfies Record<ArgName, Options>;

yargs(hideBin(process.argv))
  .command('init', 'configure the package to use bob', {}, init)
  .command('build', 'build files for publishing', args, build)
  .demandCommand()
  .recommendCommands()
  .strict()
  .parse();

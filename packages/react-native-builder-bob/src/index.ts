import yargs from 'yargs';
import { build } from './build';
import { init } from './init';
import type { Target } from './types';

const args = {
  cwd: {
    type: 'string',
    description: 'The current working directory',
  },
} as const;

yargs
  .command('init', 'Configure the package to use bob', args, init)
  .command(
    'build',
    'Build files for publishing',
    {
      ...args,
      target: {
        type: 'string',
        description: 'The target to build',
        choices: [
          'commonjs',
          'module',
          'typescript',
          'codegen',
          'custom',
        ] satisfies Target[],
      },
    },
    build
  )
  .demandCommand()
  .recommendCommands()
  .strict().argv;

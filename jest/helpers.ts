import type childProcess from 'child_process';
import spawn from 'cross-spawn';
import path from 'path';

const CLI_PATH = path.join(__dirname, '..', 'bin', 'bob');

const run = (
  args: string[],
  options = {}
): childProcess.SpawnSyncReturns<Buffer> =>
  spawn.sync('node', [CLI_PATH].concat(args), options);

export default run;

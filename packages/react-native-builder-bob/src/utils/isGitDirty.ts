import { sync as crossSpawnSync } from 'cross-spawn';

export const isGitDirty = (cwd: string = process.cwd()): boolean => {
  const result = crossSpawnSync('git', ['status', '--short'], {
    cwd,
    stdio: ['ignore', 'pipe', 'ignore'],
    encoding: 'utf-8',
  });

  if (result.error || result.status !== 0) {
    // Not a git repo or git not available
    return false;
  }

  return result.stdout.length > 0;
};

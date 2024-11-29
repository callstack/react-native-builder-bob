import { spawn } from './spawn';

export async function createInitialGitCommit(folder: string) {
  let isInGitRepo = false;

  try {
    isInGitRepo =
      (await spawn('git', ['rev-parse', '--is-inside-work-tree'])) === 'true';
  } catch (e) {
    // Ignore error
  }

  if (!isInGitRepo) {
    try {
      await spawn('git', ['init'], { cwd: folder });
      await spawn('git', ['branch', '-M', 'main'], { cwd: folder });
      await spawn('git', ['add', '.'], { cwd: folder });
      await spawn('git', ['commit', '-m', 'chore: initial commit'], {
        cwd: folder,
      });
    } catch (e) {
      // Ignore error
    }
  }
}

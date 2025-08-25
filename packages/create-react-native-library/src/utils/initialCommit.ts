import { spawn } from './spawn';

export async function createInitialGitCommit(
  folder: string,
  signal?: AbortSignal
) {
  let isInGitRepo = false;

  try {
    isInGitRepo =
      (await spawn('git', ['rev-parse', '--is-inside-work-tree'], {
        cwd: folder,
        signal,
      })) === 'true';
  } catch (error) {
    // Ignore errors
  }

  if (!isInGitRepo) {
    await spawn('git', ['init'], { cwd: folder, signal });
    await spawn('git', ['branch', '-M', 'main'], { cwd: folder, signal });
    await spawn('git', ['add', '.'], { cwd: folder, signal });
    await spawn('git', ['commit', '-m', 'chore: initial commit'], {
      cwd: folder,
      signal,
    });
  }
}

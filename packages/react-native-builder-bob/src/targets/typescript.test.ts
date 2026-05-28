import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, expect, test } from 'vitest';
import { findBinInAncestorNodeModules } from './typescript.ts';

const tempDirs: string[] = [];

async function createTempDir() {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'bob-typescript-'));
  tempDirs.push(dir);
  return dir;
}

async function touch(file: string) {
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, '');
}

afterEach(async () => {
  const dirs = tempDirs.splice(0);

  await Promise.all(
    dirs.map(async (dir) => rm(dir, { force: true, recursive: true }))
  );
});

test('finds a binary in ancestor node_modules', async () => {
  const workspace = await createTempDir();
  const packageRoot = path.join(workspace, 'packages', 'library');
  const tsc = path.join(workspace, 'node_modules', '.bin', 'tsc');

  await mkdir(packageRoot, { recursive: true });
  await touch(tsc);

  await expect(findBinInAncestorNodeModules(packageRoot, 'tsc')).resolves.toBe(
    tsc
  );
});

test('prefers the nearest node_modules binary', async () => {
  const workspace = await createTempDir();
  const packageRoot = path.join(workspace, 'packages', 'library');
  const hoistedTsc = path.join(workspace, 'node_modules', '.bin', 'tsc');
  const localTsc = path.join(packageRoot, 'node_modules', '.bin', 'tsc');

  await touch(hoistedTsc);
  await touch(localTsc);

  await expect(findBinInAncestorNodeModules(packageRoot, 'tsc')).resolves.toBe(
    localTsc
  );
});

test('returns undefined when a binary cannot be found', async () => {
  const packageRoot = await createTempDir();

  await expect(
    findBinInAncestorNodeModules(packageRoot, 'tsc')
  ).resolves.toBeUndefined();
});

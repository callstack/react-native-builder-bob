import path from 'node:path';
import mockFs from 'mock-fs';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import build, { findBinInAncestorNodeModules } from '../targets/typescript.ts';
import type { Report } from '../types.ts';
import { spawn } from '../utils/spawn.ts';

const whichMock = vi.hoisted(() =>
  vi.fn<(cmd: string, options: { nothrow: true }) => Promise<string | null>>()
);

vi.mock('which', () => ({
  default: whichMock,
}));

vi.mock('../utils/spawn.ts', () => ({
  spawn: vi.fn(),
}));

const workspace = path.resolve('/workspace');
const packageRoot = path.join(workspace, 'packages', 'library');
const source = path.join(packageRoot, 'src');
const output = path.join(packageRoot, 'lib');
const spawnMock = vi.mocked(spawn);

function createReport(): Report {
  return {
    error: vi.fn(),
    info: vi.fn(),
    success: vi.fn(),
    warn: vi.fn(),
  };
}

function library(files = {}) {
  return {
    'package.json': JSON.stringify({ name: 'library' }),
    'tsconfig.json': '{}',
    src: {},
    ...files,
  };
}

async function buildTypescript(options?: { tsc?: string }) {
  const report = createReport();

  await build({
    root: packageRoot,
    source,
    output,
    report,
    options,
    variants: { commonjs: true },
    esm: false,
  });

  return report;
}

beforeEach(() => {
  whichMock.mockResolvedValue(null);
  spawnMock.mockResolvedValue('');
});

afterEach(() => {
  mockFs.restore();
  vi.clearAllMocks();
});

test('finds the nearest binary before the lookup limit', async () => {
  const localTsc = path.join(packageRoot, 'node_modules', '.bin', 'tsc');

  mockFs({
    [workspace]: {
      packages: {
        library: {
          node_modules: {
            '.bin': {
              tsc: '',
            },
          },
        },
      },
      node_modules: {
        '.bin': {
          tsc: '',
        },
      },
    },
  });

  await expect(
    findBinInAncestorNodeModules(packageRoot, 'tsc', workspace)
  ).resolves.toBe(localTsc);
});

test('stops looking for binaries at the lookup limit', async () => {
  const home = path.resolve('/home/user');
  const workspace = path.join(home, 'workspace');
  const packageRoot = path.join(workspace, 'packages', 'library');

  mockFs({
    [home]: {
      node_modules: {
        '.bin': {
          tsc: '',
        },
      },
      workspace: {
        packages: {
          library: {},
        },
      },
    },
  });

  await expect(
    findBinInAncestorNodeModules(packageRoot, 'tsc', workspace)
  ).resolves.toBeUndefined();
});

test('finds Windows command binaries before the lookup limit', async () => {
  const tsc = path.join(workspace, 'node_modules', '.bin', 'tsc.cmd');

  mockFs({
    [workspace]: {
      packages: {
        library: {},
      },
      node_modules: {
        '.bin': {
          'tsc.cmd': '',
        },
      },
    },
  });

  await expect(
    findBinInAncestorNodeModules(packageRoot, 'tsc.cmd', workspace)
  ).resolves.toBe(tsc);
});

test('uses explicit tsc option without automatic lookup', async () => {
  const tsc = path.join(packageRoot, 'scripts', 'tsc');

  mockFs({
    [workspace]: {
      'yarn.lock': '',
      packages: {
        library: library({
          scripts: {
            tsc: '',
          },
        }),
      },
    },
  });

  whichMock.mockResolvedValue(
    path.join(workspace, 'node_modules', '.bin', 'tsc')
  );

  await buildTypescript({ tsc: 'scripts/tsc' });

  expect(whichMock).not.toHaveBeenCalled();
  expect(spawnMock).toHaveBeenCalledWith(
    tsc,
    expect.any(Array),
    expect.any(Object)
  );
});

test('prefers package node_modules tsc over PATH', async () => {
  const localTsc = path.join(packageRoot, 'node_modules', '.bin', 'tsc');

  mockFs({
    [workspace]: {
      'yarn.lock': '',
      packages: {
        library: library({
          node_modules: {
            '.bin': {
              tsc: '',
            },
          },
        }),
      },
    },
  });

  whichMock.mockResolvedValue(
    path.join(workspace, 'node_modules', '.bin', 'tsc')
  );

  await buildTypescript();

  expect(whichMock).not.toHaveBeenCalled();
  expect(spawnMock).toHaveBeenCalledWith(
    localTsc,
    expect.any(Array),
    expect.any(Object)
  );
});

test('uses tsc from PATH when package node_modules does not contain it', async () => {
  const tsc = path.join(workspace, 'node_modules', '.bin', 'tsc');

  mockFs({
    [workspace]: {
      'yarn.lock': '',
      node_modules: {
        '.bin': {
          tsc: '',
        },
      },
      packages: {
        library: library(),
      },
    },
  });

  whichMock.mockResolvedValue(tsc);

  const report = await buildTypescript();

  expect(report.warn).not.toHaveBeenCalledWith(
    expect.stringContaining('outside the workspace root')
  );
  expect(spawnMock).toHaveBeenCalledWith(
    tsc,
    expect.any(Array),
    expect.any(Object)
  );
});

test('warns when tsc from PATH is outside the workspace root', async () => {
  const tsc = path.resolve('/home/user/node_modules/.bin/tsc');

  mockFs({
    [workspace]: {
      'yarn.lock': '',
      packages: {
        library: library(),
      },
    },
    '/home/user/node_modules/.bin': {
      tsc: '',
    },
  });

  whichMock.mockResolvedValue(tsc);

  const report = await buildTypescript();

  expect(report.warn).toHaveBeenCalledWith(
    expect.stringContaining('outside the workspace root')
  );
  expect(spawnMock).toHaveBeenCalledWith(
    tsc,
    expect.any(Array),
    expect.any(Object)
  );
});

test.each([
  'bun.lock',
  'bun.lockb',
  'package-lock.json',
  'pnpm-lock.yaml',
  'yarn.lock',
])('uses %s to bound ancestor node_modules lookup', async (lockfile) => {
  const tsc = path.join(workspace, 'node_modules', '.bin', 'tsc');

  mockFs({
    [workspace]: {
      [lockfile]: '',
      node_modules: {
        '.bin': {
          tsc: '',
        },
      },
      packages: {
        library: library(),
      },
    },
  });

  await buildTypescript();

  expect(spawnMock).toHaveBeenCalledWith(
    tsc,
    expect.any(Array),
    expect.any(Object)
  );
});

test('does not traverse outside package root when no lockfile is found', async () => {
  mockFs({
    [workspace]: {
      node_modules: {
        '.bin': {
          tsc: '',
        },
      },
      packages: {
        library: library(),
      },
    },
  });

  await expect(buildTypescript()).rejects.toThrow(
    'Failed to build definition files.'
  );

  expect(spawnMock).not.toHaveBeenCalled();
});

test('fails when tsc cannot be found in PATH or workspace node_modules', async () => {
  mockFs({
    [workspace]: {
      'yarn.lock': '',
      packages: {
        library: library(),
      },
    },
  });

  await expect(buildTypescript()).rejects.toThrow(
    'Failed to build definition files.'
  );

  expect(spawnMock).not.toHaveBeenCalled();
});

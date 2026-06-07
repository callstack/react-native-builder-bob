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

function mockProject(files = {}) {
  mockFs({
    [workspace]: {
      'yarn.lock': '',
      packages: {
        library: {
          'package.json': JSON.stringify({ name: 'library' }),
          'tsconfig.json': '{}',
          src: {},
          ...files,
        },
      },
    },
  });
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

test('finds a binary in ancestor node_modules', async () => {
  const tsc = path.join(workspace, 'node_modules', '.bin', 'tsc');

  mockFs({
    [workspace]: {
      'yarn.lock': '',
      packages: {
        library: {},
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
  ).resolves.toBe(tsc);
});

test('prefers the nearest node_modules binary', async () => {
  const localTsc = path.join(packageRoot, 'node_modules', '.bin', 'tsc');

  mockFs({
    [workspace]: {
      'yarn.lock': '',
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

test('stops looking for binaries at the workspace root', async () => {
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
        'yarn.lock': '',
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

test.each([
  'bun.lock',
  'bun.lockb',
  'package-lock.json',
  'pnpm-lock.yaml',
  'yarn.lock',
])('uses %s to find the workspace root', async (lockfile) => {
  const tsc = path.join(workspace, 'node_modules', '.bin', 'tsc');

  mockFs({
    [workspace]: {
      [lockfile]: '',
      packages: {
        library: {},
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
  ).resolves.toBe(tsc);
});

test('prefers package node_modules tsc over PATH', async () => {
  const localTsc = path.join(packageRoot, 'node_modules', '.bin', 'tsc');
  const pathTsc = path.join(packageRoot, 'bin', 'tsc');

  mockProject({
    bin: {
      tsc: '',
    },
    node_modules: {
      '.bin': {
        tsc: '',
      },
    },
  });

  whichMock.mockResolvedValue(pathTsc);

  await buildTypescript();

  expect(whichMock).not.toHaveBeenCalled();
  expect(spawnMock).toHaveBeenCalledWith(
    localTsc,
    expect.any(Array),
    expect.any(Object)
  );
});

test('does not warn when tsc from PATH is inside the workspace root', async () => {
  const pathTsc = path.join(workspace, 'node_modules', '.bin', 'tsc');

  mockFs({
    [workspace]: {
      'yarn.lock': '',
      node_modules: {
        '.bin': {
          tsc: '',
        },
      },
      packages: {
        library: {
          'package.json': JSON.stringify({ name: 'library' }),
          'tsconfig.json': '{}',
          src: {},
        },
      },
    },
  });

  whichMock.mockResolvedValue(pathTsc);

  const report = await buildTypescript();

  expect(report.warn).not.toHaveBeenCalledWith(
    expect.stringContaining('outside the workspace root')
  );
  expect(spawnMock).toHaveBeenCalledWith(
    pathTsc,
    expect.any(Array),
    expect.any(Object)
  );
});

test('warns when tsc from PATH is outside the workspace root', async () => {
  const pathTsc = path.resolve('/home/user/node_modules/.bin/tsc');

  mockFs({
    [workspace]: {
      'yarn.lock': '',
      packages: {
        library: {
          'package.json': JSON.stringify({ name: 'library' }),
          'tsconfig.json': '{}',
          src: {},
        },
      },
    },
    '/home/user/node_modules/.bin': {
      tsc: '',
    },
  });

  whichMock.mockResolvedValue(pathTsc);

  const report = await buildTypescript();

  expect(report.warn).toHaveBeenCalledWith(
    expect.stringContaining('outside the workspace root')
  );
  expect(spawnMock).toHaveBeenCalledWith(
    pathTsc,
    expect.any(Array),
    expect.any(Object)
  );
});

test('falls back to ancestor node_modules when tsc is missing from PATH', async () => {
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
        library: {
          'package.json': JSON.stringify({ name: 'library' }),
          'tsconfig.json': '{}',
          src: {},
        },
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

test('fails when tsc cannot be found in PATH or workspace node_modules', async () => {
  mockProject();

  await expect(buildTypescript()).rejects.toThrow(
    'Failed to build definition files.'
  );

  expect(spawnMock).not.toHaveBeenCalled();
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
        library: {
          'package.json': JSON.stringify({ name: 'library' }),
          'tsconfig.json': '{}',
          src: {},
        },
      },
    },
  });

  await expect(buildTypescript()).rejects.toThrow(
    'Failed to build definition files.'
  );

  expect(spawnMock).not.toHaveBeenCalled();
});

test('uses explicit tsc option without automatic lookup', async () => {
  const tsc = path.join(packageRoot, 'scripts', 'tsc');

  mockProject({
    scripts: {
      tsc: '',
    },
  });

  whichMock.mockResolvedValue(path.join(workspace, 'bin', 'tsc'));

  await buildTypescript({ tsc: 'scripts/tsc' });

  expect(whichMock).not.toHaveBeenCalled();
  expect(spawnMock).toHaveBeenCalledWith(
    tsc,
    expect.any(Array),
    expect.any(Object)
  );
});

test('finds Windows command binaries in ancestor node_modules', async () => {
  const tsc = path.join(workspace, 'node_modules', '.bin', 'tsc.cmd');

  mockFs({
    [workspace]: {
      'yarn.lock': '',
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

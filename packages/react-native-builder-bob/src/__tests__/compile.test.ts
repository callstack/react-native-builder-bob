import os from 'node:os';
import path from 'node:path';
import fs from 'fs-extra';
import { beforeEach, expect, test, vi } from 'vitest';
import buildCommonJS from '../targets/commonjs.ts';
import buildModule from '../targets/module.ts';
import type { Report } from '../types.ts';
import { spawn } from '../utils/spawn.ts';

const report: Report = {
  info: vi.fn(),
  warn: vi.fn(),
  success: vi.fn(),
  error: vi.fn(),
};

beforeEach(() => {
  vi.mocked(report.warn).mockClear();
});

const buildLibrary = async (
  root: string,
  {
    files,
    packageJson,
    targets,
    output = path.join(root, 'lib'),
  }: {
    files: Record<string, string>;
    packageJson?: Record<string, unknown>;
    targets: ('commonjs' | 'module')[];
    output?: string;
  }
) => {
  await fs.writeJSON(path.join(root, 'package.json'), {
    name: 'library',
    version: '1.0.0',
    ...packageJson,
  });

  await Promise.all(
    Object.entries(files).map(async ([name, content]) =>
      fs.outputFile(path.join(root, name), content)
    )
  );

  const variants = {
    commonjs: targets.includes('commonjs'),
    module: targets.includes('module'),
  };

  for (const target of targets) {
    const build = target === 'commonjs' ? buildCommonJS : buildModule;

    await build({
      root,
      source: path.join(root, 'src'),
      output: path.join(output, target),
      exclude: '**/{__tests__,__fixtures__,__mocks__}/**',
      options: {
        esm: true,
        // The default preset loads the babel plugin from the built files
        // So it can't be used when running tests against the source code
        configFile: path.resolve(
          import.meta.dirname,
          '../__fixtures__/babel.config.js'
        ),
      },
      variants,
      report,
    });
  }
};

const getImportsWarnings = () =>
  vi
    .mocked(report.warn)
    .mock.calls.map(([message]) => message)
    .filter((message) => message.includes("won't apply to the files in"));

const readPackageJson = async (output: string): Promise<unknown> => {
  const packageJsonPath = path.join(output, 'package.json');

  return (await fs.pathExists(packageJsonPath))
    ? fs.readJSON(packageJsonPath)
    : undefined;
};

test.each([
  ['module', undefined, { type: 'module' }],
  ['module', 'commonjs', { type: 'module' }],
  ['module', 'module', undefined],
  ['commonjs', undefined, { type: 'commonjs' }],
  ['commonjs', 'module', { type: 'commonjs' }],
  ['commonjs', 'commonjs', undefined],
] as const)(
  'writes package.json for %s output when the root type is %s',
  async (target, type, expected) => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), 'bob-compile-'));

    try {
      await buildLibrary(root, {
        packageJson: { type },
        files: { 'src/index.ts': 'export const foo = 42;\n' },
        targets: [target],
      });

      expect(await readPackageJson(path.join(root, 'lib', target))).toEqual(
        expected
      );
    } finally {
      await fs.remove(root);
    }
  }
);

test.each(['module', 'commonjs'] as const)(
  'resolves package imports in %s output when package.json has the same type',
  async (target) => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), 'bob-compile-'));

    try {
      await buildLibrary(root, {
        packageJson: {
          type: target,
          imports: {
            '#internal/*': `./lib/${target}/internal/*.js`,
          },
        },
        files: {
          'src/index.ts': [
            "import { foo } from '#internal/foo';",
            '',
            'console.log(foo);',
          ].join('\n'),
          'src/internal/foo.ts': "export const foo = 'bar';\n",
        },
        targets: [target],
      });

      expect(getImportsWarnings()).toEqual([]);

      const stdout = await spawn(
        process.execPath,
        [path.join(root, 'lib', target, 'index.js')],
        { cwd: root }
      );

      expect(stdout).toBe('bar');
    } finally {
      await fs.remove(root);
    }
  }
);

test.each([
  [['module', 'commonjs'], 'module'],
  [['commonjs'], 'commonjs'],
] as const)(
  'warns about package imports for %j targets only in %s output',
  async (targets, warned) => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), 'bob-compile-'));

    try {
      await buildLibrary(root, {
        packageJson: { imports: { '#internal/*': './src/internal/*.ts' } },
        files: { 'src/index.ts': 'export const foo = 42;\n' },
        targets: [...targets],
      });

      expect(getImportsWarnings()).toEqual([
        expect.stringContaining(path.join('lib', warned)),
      ]);
    } finally {
      await fs.remove(root);
    }
  }
);

test('does not warn about an empty imports field', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'bob-compile-'));

  try {
    await buildLibrary(root, {
      packageJson: { imports: {} },
      files: { 'src/index.ts': 'export const foo = 42;\n' },
      targets: ['module'],
    });

    expect(await readPackageJson(path.join(root, 'lib/module'))).toEqual({
      type: 'module',
    });

    expect(getImportsWarnings()).toEqual([]);
  } finally {
    await fs.remove(root);
  }
});

test.each(['module', undefined])(
  'writes package.json without warning when the output is outside the project and the root type is %s',
  async (type) => {
    const parent = await fs.mkdtemp(path.join(os.tmpdir(), 'bob-compile-'));
    const root = path.join(parent, 'library');

    try {
      await fs.mkdirp(root);

      await buildLibrary(root, {
        packageJson: {
          type,
          imports: {
            '#internal/*': './src/internal/*.ts',
          },
        },
        files: { 'src/index.ts': 'export const foo = 42;\n' },
        targets: ['module'],
        output: path.join(parent, 'dist'),
      });

      expect(await readPackageJson(path.join(parent, 'dist/module'))).toEqual({
        type: 'module',
      });

      expect(getImportsWarnings()).toEqual([]);
    } finally {
      await fs.remove(parent);
    }
  }
);

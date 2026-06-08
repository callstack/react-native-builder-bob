import os from 'node:os';
import path from 'node:path';
import { decode } from '@jridgewell/sourcemap-codec';
import fs from 'fs-extra';
import { expect, test, vi } from 'vitest';
import build from '../targets/typescript.ts';
import type { Report } from '../types.ts';
import { spawn } from '../utils/spawn.ts';

const tsc = path.resolve(
  import.meta.dirname,
  '../../../../node_modules/.bin',
  process.platform === 'win32' ? 'tsc.cmd' : 'tsc'
);

const report: Report = {
  info: vi.fn(),
  warn: vi.fn(),
  success: vi.fn(),
  error: vi.fn(),
};

const readDeclarationMap = async (filepath: string) => {
  const value: unknown = await fs.readJSON(filepath);

  if (
    value == null ||
    typeof value !== 'object' ||
    !('mappings' in value) ||
    typeof value.mappings !== 'string' ||
    !('sources' in value) ||
    !Array.isArray(value.sources) ||
    !value.sources.every((source) => typeof source === 'string')
  ) {
    throw new Error('Invalid declaration map.');
  }

  return {
    mappings: value.mappings,
    sources: value.sources,
  };
};

const buildLibrary = async (
  root: string,
  {
    files,
    compilerOptions,
    packageJson,
  }: {
    files: Record<string, string>;
    compilerOptions?: Record<string, unknown>;
    packageJson?: Record<string, unknown>;
  }
) => {
  await fs.writeJSON(path.join(root, 'package.json'), {
    name: 'library',
    version: '1.0.0',
    type: 'module',
    exports: {
      '.': {
        types: './lib/typescript/src/index.d.ts',
      },
    },
    ...packageJson,
  });

  await fs.writeJSON(path.join(root, 'tsconfig.json'), {
    compilerOptions: {
      module: 'ESNext',
      moduleResolution: 'Bundler',
      rootDir: '.',
      strict: true,
      target: 'ESNext',
      ...compilerOptions,
    },
    include: ['src/**/*'],
  });

  await Promise.all(
    Object.entries(files).map(async ([name, content]) =>
      fs.outputFile(path.join(root, name), content)
    )
  );

  await build({
    root,
    source: path.join(root, 'src'),
    output: path.join(root, 'lib/typescript'),
    report,
    options: { project: 'tsconfig.json', tsc },
    esm: true,
    variants: { module: true },
  });
};

const typeCheckConsumer = async (root: string, index: string) => {
  const consumer = path.join(root, 'consumer');

  await fs.ensureSymlink(root, path.join(consumer, 'node_modules/library'));
  await fs.writeJSON(path.join(consumer, 'package.json'), {
    type: 'module',
  });
  await fs.writeJSON(path.join(consumer, 'tsconfig.json'), {
    compilerOptions: {
      module: 'NodeNext',
      moduleResolution: 'NodeNext',
      strict: true,
      target: 'ESNext',
    },
    include: ['index.ts'],
  });
  await fs.outputFile(path.join(consumer, 'index.ts'), index);

  try {
    await spawn(tsc, ['--noEmit', '--project', 'tsconfig.json'], {
      cwd: consumer,
    });

    return undefined;
  } catch (error) {
    if (
      error != null &&
      typeof error === 'object' &&
      'stdout' in error &&
      typeof error.stdout === 'string'
    ) {
      return error.stdout;
    }

    throw error;
  }
};

test('adds extensions to declarations for NodeNext resolution', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'bob-typescript-'));

  try {
    await buildLibrary(root, {
      compilerOptions: { allowImportingTsExtensions: true },
      files: {
        'src/index.ts': [
          "export { type Foo } from './foo';",
          "export * from './star';",
          "export { type Bar } from './nested';",
          "export { type Baz } from './explicit.ts';",
          "export type UsesImportType = import('./foo').Foo;",
        ].join('\n'),
        'src/foo.ts': 'export type Foo = { value: string };\n',
        'src/star.ts': 'export type Star = { value: string };\n',
        'src/nested/index.ts': 'export type Bar = { value: string };\n',
        'src/explicit.ts': 'export type Baz = { value: string };\n',
      },
    });

    const declaration = await fs.readFile(
      path.join(root, 'lib/typescript/src/index.d.ts'),
      'utf-8'
    );

    expect(declaration).toContain("from './foo.js'");
    expect(declaration).toContain("from './star.js'");
    expect(declaration).toContain("from './nested/index.js'");
    expect(declaration).toContain("from './explicit.js'");
    expect(declaration).toContain("import('./foo.js').Foo");

    const declarationMap = await readDeclarationMap(
      path.join(root, 'lib/typescript/src/index.d.ts.map')
    );

    expect(declarationMap.mappings).toEqual(expect.any(String));
    expect(
      declarationMap.sources.some((source) => source.endsWith('/src/index.ts'))
    ).toBe(true);

    const firstLine = declaration.split('\n')[0];
    const firstLineColumns = decode(declarationMap.mappings)[0]?.map(
      (segment) => segment[0]
    );

    expect(firstLineColumns).toContain(firstLine?.indexOf(';'));

    const stdout = await typeCheckConsumer(
      root,
      [
        "import type { Bar, Baz, Foo, Star, UsesImportType } from 'library';",
        '',
        'type Test = [Bar, Baz, Foo, Star, UsesImportType];',
      ].join('\n')
    );

    expect(stdout).toBeUndefined();
  } finally {
    await fs.remove(root);
  }
});

test('keeps codegen spec imports unchanged', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'bob-typescript-'));

  try {
    await buildLibrary(root, {
      packageJson: {
        codegenConfig: { name: 'Lib', type: 'all', jsSrcsDir: 'src' },
      },
      files: {
        'src/index.ts': [
          "export { default as Foo } from './FooNativeComponent';",
          "export { type Bar } from './bar';",
        ].join('\n'),
        'src/FooNativeComponent.ts': [
          'declare function codegenNativeComponent<T>(name: string): T;',
          'export type FooProps = { value: string };',
          "export default codegenNativeComponent<FooProps>('Foo');",
        ].join('\n'),
        'src/bar.ts': 'export type Bar = { value: string };\n',
      },
    });

    const declaration = await fs.readFile(
      path.join(root, 'lib/typescript/src/index.d.ts'),
      'utf-8'
    );

    expect(declaration).toContain("from './FooNativeComponent'");
    expect(declaration).not.toContain("from './FooNativeComponent.js'");
    // Non-codegen imports are still rewritten as usual
    expect(declaration).toContain("from './bar.js'");
  } finally {
    await fs.remove(root);
  }
});

test('keeps platform-specific declaration imports extensionless', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'bob-typescript-'));

  try {
    await buildLibrary(root, {
      files: {
        'src/index.ts': "export { type Platform } from './platform';\n",
        'src/platform.ts': 'export type Platform = { value: string };\n',
        'src/platform.ios.ts': 'export type Platform = { value: string };\n',
      },
    });

    const declaration = await fs.readFile(
      path.join(root, 'lib/typescript/src/index.d.ts'),
      'utf-8'
    );

    expect(declaration).toContain("from './platform'");
    expect(declaration).not.toContain("from './platform.js'");

    const stdout = await typeCheckConsumer(
      root,
      [
        "import type { Platform } from 'library';",
        '',
        'type Test = Platform;',
      ].join('\n')
    );

    expect(stdout).toContain(
      'Relative import paths need explicit file extensions'
    );
  } finally {
    await fs.remove(root);
  }
});

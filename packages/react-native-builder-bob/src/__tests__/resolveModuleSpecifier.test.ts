import nodeFs from 'node:fs';
import path from 'node:path';
import fs from 'fs-extra';
import mockFs from 'mock-fs';
import { afterEach, expect, test, vi } from 'vitest';
import { resolveModuleSpecifier } from '../utils/resolveModuleSpecifier.ts';

const jsExtensions = ['ts', 'tsx', 'js', 'jsx'].map((source) => ({
  source,
  output: 'js',
}));

const explicitJsExtensions = ['ts', 'tsx'].map((source) => ({
  source,
  output: 'js',
}));

const declarationExtensions = [{ source: 'd.ts', output: 'js' }];

const explicitDeclarationExtensions = ['ts', 'tsx'].map((source) => ({
  source,
  emitted: declarationExtensions,
}));

afterEach(() => {
  vi.restoreAllMocks();
  mockFs.restore();
});

const preserveThrowIfNoEntry = () => {
  const lstatSync = nodeFs.lstatSync;

  vi.spyOn(nodeFs, 'lstatSync').mockImplementation((filename, options) => {
    try {
      return lstatSync(filename, options);
    } catch (error) {
      if (
        options != null &&
        typeof options === 'object' &&
        'throwIfNoEntry' in options &&
        options.throwIfNoEntry === false &&
        error != null &&
        typeof error === 'object' &&
        'code' in error &&
        error.code === 'ENOENT'
      ) {
        return undefined;
      }

      throw error;
    }
  });
};

const resolve = async (
  files: string[],
  specifier: string,
  mode: 'js' | 'declaration' = 'js'
) => {
  const root = path.resolve('/project');

  mockFs({
    [root]: {},
  });
  preserveThrowIfNoEntry();

  await Promise.all(
    files.map(async (file) => fs.outputFile(path.join(root, file), ''))
  );

  return resolveModuleSpecifier({
    filepath: path.join(root, 'src/index.ts'),
    specifier,
    extensions: mode === 'js' ? jsExtensions : declarationExtensions,
    explicitExtensions:
      mode === 'js' ? explicitJsExtensions : explicitDeclarationExtensions,
  });
};

test('adds output extensions to relative module specifiers', async () => {
  expect(await resolve(['src/foo.ts'], './foo')).toBe('./foo.js');
});

test('keeps non-relative module specifiers unchanged', async () => {
  expect(await resolve([], 'react')).toBe('react');
});

test('replaces explicit source extensions', async () => {
  expect(await resolve(['src/foo.ts'], './foo.ts')).toBe('./foo.js');
});

test('expands folder imports to index files', async () => {
  expect(await resolve(['src/foo/index.ts'], './foo')).toBe('./foo/index.js');
});

test('keeps imports extensionless when a platform-specific file exists', async () => {
  expect(await resolve(['src/foo.ts', 'src/foo.ios.ts'], './foo')).toBe(
    './foo'
  );
});

test('keeps folder imports extensionless when a platform-specific index file exists', async () => {
  expect(
    await resolve(['src/foo/index.ts', 'src/foo/index.ios.ts'], './foo')
  ).toBe('./foo');
});

test('replaces explicit source extensions when an emitted file exists', async () => {
  expect(await resolve(['src/foo.d.ts'], './foo.ts', 'declaration')).toBe(
    './foo.js'
  );
});

test('keeps explicit mts source extensions unchanged', async () => {
  expect(await resolve(['src/foo.d.mts'], './foo.mts', 'declaration')).toBe(
    './foo.mts'
  );
});

test('keeps explicit cts source extensions unchanged', async () => {
  expect(await resolve(['src/foo.d.cts'], './foo.cts', 'declaration')).toBe(
    './foo.cts'
  );
});

test('keeps declaration imports extensionless when a platform-specific declaration exists', async () => {
  expect(
    await resolve(['src/foo.d.ts', 'src/foo.ios.d.ts'], './foo', 'declaration')
  ).toBe('./foo');
});

test('keeps declaration folder imports extensionless when a platform-specific index declaration exists', async () => {
  expect(
    await resolve(
      ['src/foo/index.d.ts', 'src/foo/index.ios.d.ts'],
      './foo',
      'declaration'
    )
  ).toBe('./foo');
});

test('replaces explicit source declaration imports even when a platform-specific declaration exists', async () => {
  expect(
    await resolve(
      ['src/foo.d.ts', 'src/foo.ios.d.ts'],
      './foo.ts',
      'declaration'
    )
  ).toBe('./foo.js');
});

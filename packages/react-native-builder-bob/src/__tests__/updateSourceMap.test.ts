import path from 'node:path';
import { encode } from '@jridgewell/sourcemap-codec';
import mockFs from 'mock-fs';
import fs from 'fs-extra';
import ts from 'typescript';
import { afterEach, expect, test } from 'vitest';
import { type Replacement, updateSourceMap } from '../utils/updateSourceMap.ts';

const mappings = (lines: number[][]) =>
  encode(lines.map((columns) => columns.map((column): [number] => [column])));

const readMap = async (filepath: string) => {
  const map: unknown = await fs.readJSON(filepath);

  if (
    map == null ||
    typeof map !== 'object' ||
    !('mappings' in map) ||
    typeof map.mappings !== 'string'
  ) {
    throw new Error('Invalid source map.');
  }

  return map;
};

afterEach(() => {
  mockFs.restore();
});

// Write a map with the given mappings, run updateSourceMap, then return the result.
const update = async (
  generated: string,
  replacements: Replacement[],
  code = 'x'.repeat(100)
) => {
  const root = path.resolve('/project');
  const filepath = path.join(root, 'index.d.ts.map');
  const sourceFile = ts.createSourceFile(
    'index.d.ts',
    code,
    ts.ScriptTarget.Latest,
    true
  );

  mockFs({
    [root]: {},
  });

  await fs.writeJSON(filepath, {
    version: 3,
    file: 'index.d.ts',
    sourceRoot: '',
    sources: ['index.ts'],
    names: ['Name'],
    mappings: generated,
    sourcesContent: ['source'],
  });

  await updateSourceMap({ filepath, replacements, sourceFile });

  return await readMap(filepath);
};

test('updates mappings for multiple replacements on the same line', async () => {
  const map = await update(mappings([[0, 17, 21, 40]]), [
    { start: 10, end: 15, value: 'x'.repeat(8) },
    { start: 30, end: 35, value: 'x'.repeat(8) },
  ]);

  expect(map.mappings).toBe(mappings([[0, 20, 24, 46]]));
});

test('shifts mappings at the end of the replacement range', async () => {
  const map = await update(mappings([[0, 12, 15, 20]]), [
    { start: 10, end: 15, value: 'x'.repeat(8) },
  ]);

  expect(map.mappings).toBe(mappings([[0, 12, 18, 23]]));
});

test('updates only the line containing the replacement', async () => {
  const map = await update(
    mappings([
      [0, 20],
      [0, 20],
    ]),
    [{ start: 41, end: 46, value: 'x'.repeat(8) }],
    `${'x'.repeat(30)}\n${'x'.repeat(30)}`
  );

  expect(map.mappings).toBe(
    mappings([
      [0, 20],
      [0, 23],
    ])
  );
});

test('throws for replacements that span multiple lines', async () => {
  const generated = mappings([
    [0, 5],
    [0, 5],
  ]);

  await expect(
    update(
      generated,
      [{ start: 3, end: 8, value: 'x'.repeat(10) }],
      'xxxxx\nxxxxx'
    )
  ).rejects.toThrow(
    'Source map replacement spanning multiple lines is not supported.'
  );
});

test('preserves source map metadata', async () => {
  const map = await update(mappings([[0, 20]]), [
    { start: 10, end: 15, value: 'x'.repeat(8) },
  ]);

  expect(map).toMatchObject({
    file: 'index.d.ts',
    names: ['Name'],
    sourceRoot: '',
    sources: ['index.ts'],
    sourcesContent: ['source'],
  });
});

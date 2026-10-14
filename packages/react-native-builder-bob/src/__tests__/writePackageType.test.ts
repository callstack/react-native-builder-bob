import os from 'node:os';
import path from 'node:path';
import fs from 'fs-extra';
import { expect, test, vi } from 'vitest';
import type { Report } from '../types.ts';
import { writePackageType } from '../utils/writePackageType.ts';

const createReport = (): Report => ({
  info: vi.fn(),
  warn: vi.fn(),
  success: vi.fn(),
  error: vi.fn(),
});

test.each([
  ['module', undefined, { type: 'module' }],
  ['module', 'commonjs', { type: 'module' }],
  ['module', 'module', undefined],
  ['commonjs', undefined, { type: 'commonjs' }],
  ['commonjs', 'module', { type: 'commonjs' }],
  ['commonjs', 'commonjs', undefined],
] as const)(
  'handles %s output when the root type is %s',
  async (type, rootType, expected) => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), 'bob-package-type-'));
    const output = path.join(root, 'lib');
    const report = createReport();

    try {
      await fs.mkdirp(output);
      await writePackageType({
        root,
        output,
        type,
        pkg: { type: rootType },
        report,
      });

      const packageJsonPath = path.join(output, 'package.json');

      expect(
        (await fs.pathExists(packageJsonPath))
          ? await fs.readJSON(packageJsonPath)
          : undefined
      ).toEqual(expected);
      expect(report.warn).not.toHaveBeenCalled();
    } finally {
      await fs.remove(root);
    }
  }
);

test('warns about imports only when package.json is written', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'bob-package-type-'));
  const output = path.join(root, 'lib');
  const imports = { '#internal/*': './src/internal/*.ts' };

  try {
    await fs.mkdirp(output);

    const skipped = createReport();

    await writePackageType({
      root,
      output,
      type: 'module',
      pkg: { type: 'module', imports },
      report: skipped,
    });

    expect(skipped.warn).not.toHaveBeenCalled();

    const written = createReport();

    await writePackageType({
      root,
      output,
      type: 'module',
      pkg: { imports },
      report: written,
    });

    expect(written.warn).toHaveBeenCalledWith(
      expect.stringContaining("won't apply to the files in")
    );
  } finally {
    await fs.remove(root);
  }
});

test('does not warn about an empty imports field', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'bob-package-type-'));
  const output = path.join(root, 'lib');
  const report = createReport();

  try {
    await fs.mkdirp(output);
    await writePackageType({
      root,
      output,
      type: 'module',
      pkg: { imports: {} },
      report,
    });

    expect(await fs.readJSON(path.join(output, 'package.json'))).toEqual({
      type: 'module',
    });
    expect(report.warn).not.toHaveBeenCalled();
  } finally {
    await fs.remove(root);
  }
});

test('writes package.json when the output is outside the root', async () => {
  const parent = await fs.mkdtemp(path.join(os.tmpdir(), 'bob-package-type-'));
  const root = path.join(parent, 'library');
  const output = path.join(parent, 'dist');
  const report = createReport();

  try {
    await fs.mkdirp(root);
    await fs.mkdirp(output);
    await writePackageType({
      root,
      output,
      type: 'module',
      pkg: {
        type: 'module',
        imports: { '#internal/*': './src/internal/*.ts' },
      },
      report,
    });

    expect(await fs.readJSON(path.join(output, 'package.json'))).toEqual({
      type: 'module',
    });
    expect(report.warn).not.toHaveBeenCalled();
  } finally {
    await fs.remove(parent);
  }
});

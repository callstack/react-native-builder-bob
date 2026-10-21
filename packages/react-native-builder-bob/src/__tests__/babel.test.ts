import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import fsExtra from 'fs-extra';
import { expect, test, vi } from 'vitest';
import { transformFileAsync } from '@babel/core';
import buildModule from '../targets/module.ts';
import type { Report } from '../types.ts';
import plugin from '../babel.ts';

const report: Report = {
  info: vi.fn(),
  warn: vi.fn(),
  success: vi.fn(),
  error: vi.fn(),
};

test.each(['imports', 'exports'])(`adds extension to %s`, async (name) => {
  const filepath = path.resolve(
    import.meta.dirname,
    `../__fixtures__/project/code/$${name}-input.ts`
  );

  const result = await transformFileAsync(filepath, {
    caller: {
      name: 'test',
      supportsStaticESM: false,
      rewriteImportExtensions: true,
      jsxRuntime: 'automatic',
      codegenEnabled: true,
    },
    configFile: false,
    babelrc: false,
    plugins: [
      '@babel/plugin-syntax-typescript',
      [plugin, { extension: 'mjs' }],
    ],
  });

  const expected = await fs.promises.readFile(
    path.resolve(
      import.meta.dirname,
      `../__fixtures__/project/code/$${name}-output.ts`
    ),
    'utf8'
  );

  expect(result?.code).toEqual(expected.trim());
});

test.each(['preserve', 'react-native'])(
  'preserves JSX when tsconfig compilerOptions.jsx is %s',
  async (jsx) => {
    const root = await fsExtra.mkdtemp(path.join(os.tmpdir(), 'bob-babel-'));

    try {
      await fsExtra.writeJSON(path.join(root, 'package.json'), {
        name: 'library',
        version: '1.0.0',
      });

      await fsExtra.writeJSON(path.join(root, 'tsconfig.json'), {
        compilerOptions: {
          jsx,
          module: 'ESNext',
          moduleResolution: 'Bundler',
          target: 'ESNext',
        },
        include: ['src/**/*'],
      });

      await fsExtra.outputFile(
        path.join(root, 'src/index.tsx'),
        'export const Example = () => <View testID="ok" />;\n'
      );

      await buildModule({
        root,
        source: path.join(root, 'src'),
        output: path.join(root, 'lib/module'),
        exclude: '',
        options: {},
        variants: { module: true },
        report,
      });

      const output = await fs.promises.readFile(
        path.join(root, 'lib/module/index.js'),
        'utf8'
      );

      expect(output).toContain('<View testID="ok" />');
      expect(output).not.toContain('react/jsx-runtime');
      expect(output).not.toContain('_jsx');
    } finally {
      await fsExtra.remove(root);
    }
  }
);

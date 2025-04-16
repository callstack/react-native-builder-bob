import { expect, test } from 'vitest';
import { transformFileAsync } from '@babel/core';
import fs from 'node:fs';
import path from 'node:path';
import plugin from '../babel';

test.each(['imports', 'exports'])(`adds extension to %s`, async (name) => {
  const filepath = path.resolve(
    __dirname,
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
    path.resolve(__dirname, `../__fixtures__/project/code/$${name}-output.ts`),
    'utf8'
  );

  expect(result?.code).toEqual(expected.trim());
});

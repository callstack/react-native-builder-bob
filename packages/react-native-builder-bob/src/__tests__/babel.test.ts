import { expect, test } from '@jest/globals';
import { transformFileAsync } from '@babel/core';
import fs from 'node:fs';
import path from 'node:path';

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
      [require.resolve('../babel.ts'), { extension: 'mjs' }],
    ],
  });

  const expected = await fs.promises.readFile(
    path.resolve(__dirname, `../__fixtures__/project/code/$${name}-output.ts`),
    'utf8'
  );

  expect(result?.code).toEqual(expected.trim());
});

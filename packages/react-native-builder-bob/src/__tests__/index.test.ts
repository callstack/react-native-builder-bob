import { expect, it } from '@jest/globals';
import { transformFileAsync } from '@babel/core';
import fs from 'node:fs';
import path from 'node:path';

it.each(['imports', 'exports'])(`adds .js extension to %s`, async (name) => {
  const filepath = path.resolve(
    __dirname,
    `../__fixtures__/project/code/$${name}-input.ts`
  );

  const result = await transformFileAsync(filepath, {
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

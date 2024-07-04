import { expect, it } from '@jest/globals';
import { transformFileAsync } from '@babel/core';
import fs from 'node:fs';
import path from 'node:path';

it.each(['imports', 'exports'])(`adds extension to %s`, async (name) => {
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

it('replaces alias imports', async () => {
  const filepath = path.resolve(
    __dirname,
    `../__fixtures__/project/code/$alias-input.ts`
  );

  const result = await transformFileAsync(filepath, {
    cwd: __dirname,
    configFile: false,
    babelrc: false,
    plugins: [
      '@babel/plugin-syntax-typescript',
      [
        require.resolve('../babel.ts'),
        {
          alias: {
            '@': '../__fixtures__/project',
            'file': '../__fixtures__/project/f',
            'something': 'another',
          },
        },
      ],
    ],
  });

  const expected = await fs.promises.readFile(
    path.resolve(__dirname, `../__fixtures__/project/code/$alias-output.ts`),
    'utf8'
  );

  expect(result?.code).toEqual(expected.trim());
});

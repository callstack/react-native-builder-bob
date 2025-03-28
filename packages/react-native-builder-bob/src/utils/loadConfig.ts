import { cosmiconfig } from 'cosmiconfig';

// eslint-disable-next-line @typescript-eslint/no-require-imports,import-x/no-commonjs
const { name } = require('../../package.json');

const root = process.cwd();
const explorer = cosmiconfig(name, {
  stopDir: root,
  searchPlaces: [
    'package.json',
    'bob.config.mjs',
    'bob.config.cjs',
    'bob.config.js',
  ],
});

export const loadConfig = async () => {
  return explorer.search();
};

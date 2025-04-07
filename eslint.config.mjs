// eslint-disable-next-line import-x/no-unresolved
import { defineConfig, globalIgnores } from 'eslint/config';
import satya164 from 'eslint-config-satya164';

export default defineConfig([
  satya164,

  {
    rules: {
      'import-x/extensions': ['error', 'ignorePackages'],
    },
  },

  globalIgnores([
    '**/.next/',
    '**/.expo/',
    '**/.yarn/',
    '**/.vscode/',
    '**/node_modules/',
    '**/coverage/',
    '**/lib/',
    '**/templates/',
    '**/__fixtures__/',
  ]),
]);

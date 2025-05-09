// eslint-disable-next-line import-x/extensions,import-x/no-unresolved
import { defineConfig, globalIgnores } from 'eslint/config';
import { recommended, vitest } from 'eslint-config-satya164';

export default defineConfig(
  recommended,
  vitest,

  globalIgnores([
    '**/.next/',
    '**/.expo/',
    '**/.yarn/',
    '**/.vscode/',
    '**/node_modules/',
    '**/coverage/',
    '**/out/',
    '**/lib/',
    '**/templates/',
    '**/__fixtures__/',
  ])
);

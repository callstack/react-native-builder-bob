import { defineConfig, globalIgnores } from 'eslint/config';
import { recommended, vitest, typechecked } from 'eslint-config-satya164';

export default defineConfig(
  recommended,
  vitest,
  typechecked,

  {
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },

    rules: {
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/strict-boolean-expressions': 'off',
    },
  },

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

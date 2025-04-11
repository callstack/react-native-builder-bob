// eslint-disable-next-line import-x/extensions,import-x/no-unresolved
import { defineConfig, globalIgnores } from 'eslint/config';
import satya164 from 'eslint-config-satya164';
import vitest from '@vitest/eslint-plugin';

export default defineConfig([
  satya164,

  {
    files: ['**/*.{spec,test}.{js,ts,tsx}', '**/__tests__/**/*.{js,ts,tsx}'],

    plugins: {
      vitest,
    },

    rules: {
      ...vitest.configs.recommended.rules,

      'vitest/consistent-test-it': ['error', { fn: 'test' }],
      'vitest/expect-expect': 'error',
      'vitest/no-disabled-tests': 'error',
      'vitest/no-duplicate-hooks': 'error',
      'vitest/no-test-prefixes': 'error',
      'vitest/no-test-return-statement': 'error',
      'vitest/prefer-to-be': 'error',
      'vitest/prefer-todo': 'error',
      'vitest/require-to-throw-message': 'error',

      'jest/no-deprecated-functions': 'off',
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

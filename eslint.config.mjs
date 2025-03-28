// eslint-disable-next-line import-x/extensions,import-x/no-unresolved
import { defineConfig } from 'eslint/config';
import satya164 from 'eslint-config-satya164';

export default defineConfig([
  ...satya164,
  {
    ignores: [
      'node_modules/',
      '**/coverage/',
      '**/lib/',
      '**/templates/',
      '**/__fixtures__/',
    ],
  },
]);

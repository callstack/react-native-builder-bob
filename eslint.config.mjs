import { defineConfig } from 'eslint/config';
import globals from 'globals';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';
import { fixupConfigRules } from '@eslint/compat';
import reactDom from 'eslint-plugin-react-dom';
import reactWebApi from 'eslint-plugin-react-web-api';
import reactHooksExtra from 'eslint-plugin-react-hooks-extra';
import reactNamingConvention from 'eslint-plugin-react-naming-convention';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default defineConfig([
  {
    extends: fixupConfigRules(compat.extends('satya164')),
    plugins: {
      '@eslint-react/dom': reactDom,
      '@eslint-react/hooks-extra': reactHooksExtra,
      '@eslint-react/naming-convention': reactNamingConvention,
      '@eslint-react/web-api': reactWebApi,
    },
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
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

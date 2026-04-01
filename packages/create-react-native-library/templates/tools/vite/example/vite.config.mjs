import { fileURLToPath } from 'node:url';

import { defineConfig, mergeConfig } from 'vite';

import bobConfig from 'react-native-builder-bob/vite-config';

export default defineConfig((env) =>
  mergeConfig(bobConfig(env), {
    resolve: {
      alias: {
        '<%- project.slug -%>': fileURLToPath(new URL('..', import.meta.url)),
      },
    },
  })
);

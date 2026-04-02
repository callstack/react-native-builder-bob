import { defineConfig, mergeConfig } from 'vite';

import config from 'react-native-builder-bob/vite-config';
import pack from '../package.json' with { type: 'json' };

export default defineConfig((env) =>
  mergeConfig(config(env), {
    resolve: {
      alias: {
        '<%- project.slug -%>': new URL('..', import.meta.url),
      },
      dedupe: Object.keys(pack.peerDependencies),
    },
  })
);

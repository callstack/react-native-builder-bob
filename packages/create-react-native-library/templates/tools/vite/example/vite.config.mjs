import { defineConfig, mergeConfig } from 'vite';

import config from 'react-native-builder-bob/vite-config';
import pack from '../package.json' with { type: 'json' };

export default defineConfig((env) =>
  mergeConfig(config(env), {
    resolve: {
      alias: {
        [pack.name]: new URL('..', import.meta.url),
      },
      conditions: ['<%- project.sourceCondition -%>'],
      dedupe: Object.keys(pack.peerDependencies),
    },
  })
);

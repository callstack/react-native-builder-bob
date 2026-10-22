import react from '@vitejs/plugin-react';
import { defineConfig, transformWithOxc } from 'vite';
import commonjs from 'vite-plugin-commonjs';

const extensions = [
  '.web.tsx',
  '.tsx',
  '.web.ts',
  '.ts',
  '.web.jsx',
  '.jsx',
  '.web.js',
  '.js',
  '.web.mjs',
  '.mjs',
  '.json',
];

/** @type {import('vite').DepOptimizationOptions['rolldownOptions']} */
const rolldownOptions = {
  resolve: {
    extensions,
  },
  moduleTypes: {
    '.js': 'jsx',
  },
  transform: {
    jsx: 'react-jsx',
  },
  // Some packages such as `expo-modules-core` publish TypeScript source,
  // Where type-only names are re-exported inside `declare namespace`.
  // Rolldown keeps those imports and fails.
  // So we shim the missing exports.
  shimMissingExports: true,
};

/**
 * @param {RegExp} regex
 * @returns {import('vite').Plugin}
 */
const jsx = (regex) => ({
  name: 'js-as-jsx',
  enforce: 'pre',
  transform(code, id) {
    if (id.endsWith('.js') && regex.test(id)) {
      return transformWithOxc(code, id, {
        lang: 'jsx',
        jsx: { runtime: 'automatic' },
      });
    }

    return null;
  },
});

export default defineConfig(({ mode }) => ({
  plugins: [jsx(/\/(@expo|expo-.+)\//), commonjs(), react()],
  define: {
    __DEV__: JSON.stringify(mode !== 'production'),
    'process.env.EXPO_OS': JSON.stringify('web'),
    global: 'globalThis',
  },
  resolve: {
    extensions,
    conditions: ['module', 'browser', mode],
    alias: {
      'react-native': 'react-native-web',
    },
    dedupe: ['react', 'react-dom', 'react-native-web'],
  },
  optimizeDeps: {
    rolldownOptions,
  },
  build: {
    rolldownOptions: {
      shimMissingExports: true,
    },
  },
  ssr: {
    // React Native and Expo packages publish untranspiled code such as JSX
    // So they need to be transformed by Vite instead of being loaded by Node
    noExternal: [/^(?:@expo|expo(?:-|$)|react-native(?:-|$))/],
    optimizeDeps: {
      // `react-native-web` imports CommonJS modules that need to be pre-bundled
      include: ['react-native-web'],
      rolldownOptions: {
        ...rolldownOptions,
        plugins: [
          {
            // React is loaded by Node on the server instead of being bundled by Vite
            // So multiple copies of React maybe included if we don't externalize it
            name: 'externalize-react',
            resolveId(source) {
              if (/^react(?:-dom)?(?:\/.*)?$/.test(source)) {
                return { id: source, external: true };
              }

              return null;
            },
          },
        ],
      },
    },
  },
}));

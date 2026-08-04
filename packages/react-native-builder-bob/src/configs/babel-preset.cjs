/* eslint-disable import-x/no-commonjs, no-undef */

const browserslist = require('browserslist');
const targets = require('./default-targets.cjs');

/**
 * Babel preset for React Native Builder Bob
 *
 * @param {Boolean} options.supportsStaticESM - Whether to preserve ESM imports/exports, defaults to `false`
 * @param {Boolean} options.rewriteImportExtensions - Whether to rewrite import extensions to '.js', defaults to `false`
 * @param {'automatic' | 'classic'} options.jsxRuntime - Which JSX runtime to use, defaults to 'automatic'
 */
module.exports = function (api, options, cwd) {
  const opt = (name) =>
    options[name] !== undefined
      ? options[name]
      : api.caller((caller) => (caller != null ? caller[name] : undefined));

  const supportsStaticESM = opt('supportsStaticESM');
  const rewriteImportExtensions = opt('rewriteImportExtensions');
  const jsxRuntime = opt('jsxRuntime');

  return {
    presets: [
      [
        require.resolve('@babel/preset-env'),
        {
          targets: browserslist.findConfig(cwd) || targets.babel,
          useBuiltIns: false,
          modules: supportsStaticESM ? false : 'commonjs',
        },
      ],
      [
        require.resolve('@babel/preset-react'),
        {
          runtime: jsxRuntime !== undefined ? jsxRuntime : 'automatic',
        },
      ],
      require.resolve('@babel/preset-typescript'),
    ],
    plugins: [
      require.resolve('@babel/plugin-transform-strict-mode'),
      [
        require.resolve('babel-plugin-syntax-hermes-parser'),
        { parseLangTypes: 'flow' },
      ],
      require.resolve('@babel/plugin-transform-flow-strip-types'),
      [
        require.resolve('../babel'),
        {
          extension: rewriteImportExtensions ? 'js' : undefined,
        },
      ],
    ],
  };
};

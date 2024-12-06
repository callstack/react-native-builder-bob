/* eslint-disable import/no-commonjs */

const browserslist = require('browserslist');

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
          targets: browserslist.findConfig(cwd) || {
            browsers: [
              '> 1%',
              'chrome 109',
              'edge 124',
              'firefox 127',
              'safari 17.4',
              'not dead',
              'not ie <= 11',
              'not op_mini all',
              'not android <= 4.4',
              'not samsung <= 4',
            ],
            node: '18',
          },
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
      require.resolve('@babel/preset-flow'),
    ],
    plugins: [
      require.resolve('@babel/plugin-transform-strict-mode'),
      [
        require.resolve('./lib/babel'),
        {
          extension: rewriteImportExtensions ? 'js' : undefined,
        },
      ],
    ],
  };
};

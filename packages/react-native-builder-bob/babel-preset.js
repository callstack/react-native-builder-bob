/* eslint-disable @typescript-eslint/no-require-imports, import-x/no-commonjs, no-undef */

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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    options[name] !== undefined
      ? options[name]
      : // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        api.caller((caller) => (caller != null ? caller[name] : undefined));

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
    ],
    plugins: [
      require.resolve('@babel/plugin-transform-strict-mode'),
      [
        require.resolve('babel-plugin-syntax-hermes-parser'),
        { parseLangTypes: 'flow' },
      ],
      require.resolve('@babel/plugin-transform-flow-strip-types'),
      [
        require.resolve('./lib/babel'),
        {
          extension: rewriteImportExtensions ? 'js' : undefined,
        },
      ],
    ],
  };
};

/* eslint-disable import/no-commonjs */

const browserslist = require('browserslist');

/**
 * Babel preset for React Native Builder Bob
 * @param {'commonjs' | 'preserve'} options.modules - Whether to compile modules to CommonJS or preserve them
 * @param {Boolean} options.esm - Whether to output ES module compatible code, e.g. by adding extension to import/export statements
 */
module.exports = function (api, options, cwd) {
  const cjs = options.modules === 'commonjs';

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
          modules: cjs ? 'commonjs' : false,
        },
      ],
      [
        require.resolve('@babel/preset-react'),
        {
          runtime: 'automatic',
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
          extension: options.esm ? 'js' : undefined,
        },
      ],
    ],
  };
};

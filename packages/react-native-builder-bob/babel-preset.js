/* eslint-disable import/no-commonjs */

const browserslist = require('browserslist');

module.exports = function (api, options, cwd) {
  const cjs = options.modules === 'commonjs';

  return {
    presets: [
      [
        require.resolve('@babel/preset-env'),
        {
          targets: browserslist.findConfig(cwd) || {
            browsers: [
              '>1%',
              'last 2 chrome versions',
              'last 2 edge versions',
              'last 2 firefox versions',
              'last 2 safari versions',
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
      [
        require.resolve('./lib/babel'),
        {
          extension: cjs ? 'cjs' : 'mjs',
        },
      ],
    ],
  };
};

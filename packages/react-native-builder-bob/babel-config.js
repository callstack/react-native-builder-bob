/* eslint-disable import/no-commonjs */

const path = require('path');

/**
 * Get Babel configuration for the example project.
 * This sets up appropriate presets and plugins for the library.
 * It also aliases the library to the source directory.
 *
 * @param {import('@babel/core').TransformOptions} defaultConfig Default Babel configuration
 * @param {object} options Options to customize the configuration
 * @param {string} options.root Root directory of the monorepo
 * @param {object} options.pkg Content of package.json of the library
 * @returns {import('@babel/core').TransformOptions} Babel configuration
 */
const getConfig = (defaultConfig, { root, pkg }) => {
  let src;

  if (pkg.source.includes('/')) {
    const segments = pkg.source.split('/');

    if (segments[0] === '.') {
      segments.shift();
    }

    src = segments[0];
  }

  if (src == null) {
    throw new Error(
      "Couldn't determine the source directory. Does the 'source' field in your 'package.json' point to a file within a directory?"
    );
  }

  return {
    overrides: [
      {
        ...defaultConfig,
        exclude: path.join(root, src),
      },
      {
        include: path.join(root, src),
        presets: [[require.resolve('./babel-preset'), { modules: 'commonjs' }]],
      },
      {
        exclude: /\/node_modules\//,
        plugins: [
          [
            require.resolve('babel-plugin-module-resolver'),
            {
              extensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],
              alias: {
                [pkg.name]: path.join(root, pkg.source),
              },
            },
          ],
        ],
      },
    ],
  };
};

exports.getConfig = getConfig;

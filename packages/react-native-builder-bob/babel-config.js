/* eslint-disable import/no-commonjs */

const path = require('path');
const { cosmiconfigSync } = require('cosmiconfig');
const { lstatSync } = require('fs');
const { name } = require('./package.json');

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
  const explorer = cosmiconfigSync(name, {
    stopDir: root,
    searchPlaces: ['package.json', 'bob.config.cjs', 'bob.config.js'],
  });

  const result = explorer.search();
  const src = result ? result.config.source : null;

  if (src == null) {
    if (
      lstatSync(path.join(root, 'bob.config.mjs'), {
        throwIfNoEntry: false,
      }).isFile()
    ) {
      throw new Error(
        "Found a 'bob.config.mjs' file. However, ESM syntax is currently not supported for the Babel configuration."
      );
    } else {
      throw new Error(
        "Couldn't determine the source directory. Does your config specify a 'source' field?"
      );
    }
  }

  return {
    ...defaultConfig,
    overrides: [
      ...(defaultConfig.overrides == null ? [] : defaultConfig.overrides),
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
      {
        include: path.join(root, src),
        presets: [require.resolve('./babel-preset')],
      },
    ],
  };
};

exports.getConfig = getConfig;

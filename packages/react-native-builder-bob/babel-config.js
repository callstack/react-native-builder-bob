/* eslint-disable @typescript-eslint/no-require-imports, import-x/no-commonjs, no-undef */

const path = require('path');
const { loadConfig } = require('./lib/utils/loadConfig');

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
const getConfig = (defaultConfig, { root }) => {
  const result = loadConfig(root);

  if (result == null) {
    throw new Error(`Couldn't find a valid configuration at ${root}.`);
  }

  const { source } = result.config;

  if (source == null) {
    throw new Error(
      "Couldn't determine the source directory. Does your config specify a 'source' field?"
    );
  }

  return {
    ...defaultConfig,
    overrides: [
      ...(defaultConfig.overrides == null ? [] : defaultConfig.overrides),
      {
        include: path.join(root, source),
        presets: [
          [
            require.resolve('./babel-preset'),
            {
              // Let the app's preset handle the commonjs transform
              // Otherwise this causes `export` statements in wrong places causing syntax error
              supportsStaticESM: true,
            },
          ],
        ],
      },
    ],
  };
};

exports.getConfig = getConfig;

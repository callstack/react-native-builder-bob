/* eslint-disable @typescript-eslint/no-deprecated, @typescript-eslint/no-require-imports, import-x/no-commonjs, no-undef */

const { withMetroConfig } = require('react-native-monorepo-config');

/**
 * Get Metro configuration for the example project.
 * This sets up appropriate root and watch folders for the library.
 * It also excludes conflicting modules and aliases them to the correct place.
 *
 * @deprecated use `react-native-monorepo-config` instead
 *
 * @param {import('metro-config').MetroConfig} baseConfig Base Metro configuration
 * @param {object} options Options to customize the configuration
 * @param {string} options.root Root directory of the monorepo
 * @param {string} options.project Directory containing the example project
 * @returns {import('metro-config').MetroConfig} Metro configuration
 */
exports.getConfig = (baseConfig, { root, project }) =>
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  withMetroConfig(baseConfig, { root, dirname: project });

/* eslint-disable import/no-commonjs */

const path = require('path');
const escape = require('escape-string-regexp');
const exclusionList = require('metro-config/src/defaults/exclusionList');

/**
 * Get Metro configuration for the example project.
 * This sets up appropriate root and watch folders for the library.
 * It also excludes conflicting modules and aliases them to the correct place.
 *
 * @param {import('metro-config').MetroConfig} defaultConfig Default Metro configuration
 * @param {object} options Options to customize the configuration
 * @param {string} options.root Root directory of the monorepo
 * @param {object} options.pkg Content of package.json of the library
 * @param {string} options.project Directory containing the example project
 * @returns {import('metro-config').MetroConfig} Metro configuration
 */
const getConfig = (defaultConfig, { root, pkg, project }) => {
  const modules = [
    // AssetsRegistry is used internally by React Native to handle asset imports
    // This needs to be a singleton so all assets are registered to a single registry
    '@react-native/assets-registry',
    ...Object.keys({ ...pkg.peerDependencies }),
  ];

  /**
   * Metro configuration
   * https://facebook.github.io/metro/docs/configuration
   *
   * @type {import('metro-config').MetroConfig}
   */
  return {
    ...defaultConfig,

    projectRoot: project,
    watchFolders: [root],

    // We need to make sure that only one version is loaded for peerDependencies
    // So we block them at the root, and alias them to the versions in example project's node_modules
    resolver: {
      ...defaultConfig.resolver,

      blacklistRE: exclusionList(
        modules.map(
          (m) =>
            new RegExp(`^${escape(path.join(root, 'node_modules', m))}\\/.*$`)
        )
      ),

      extraNodeModules: modules.reduce((acc, name) => {
        acc[name] = path.join(project, 'node_modules', name);
        return acc;
      }, {}),
    },
  };
};

exports.getConfig = getConfig;

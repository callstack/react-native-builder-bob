const path = require('path');
const pak = require('../package.json');

const root = path.resolve(__dirname, '..');

module.exports = function (api) {
  api.cache(true);

  return {
    overrides: [
      {
        exclude: path.join(root, 'src'),
        presets: ['babel-preset-expo'],
      },
      {
        include: path.join(root, 'src'),
        presets: [
          [
            'module:react-native-builder-bob/babel-preset',
            { modules: 'commonjs' },
          ],
        ],
      },
      {
        exclude: /\/node_modules\//,
        plugins: [
          [
            'module-resolver',
            {
              extensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],
              alias: {
                [pak.name]: path.join(root, pak.source),
              },
            },
          ],
        ],
      },
    ],
  };
};

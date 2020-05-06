const path = require('path');
const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function(env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);

  config.module.rules.push({
    test: /\.(js|ts|tsx)$/,
    include: path.resolve('../src'),
    use: 'babel-loader',
  });

  Object.assign(config.resolve.alias, {
    react: path.resolve(__dirname, 'node_modules', 'react'),
    'react-native-web': path.resolve(
      __dirname,
      'node_modules',
      'react-native-web'
    ),
  });

  return config;
};

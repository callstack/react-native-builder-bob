const path = require('path');
const pak = require('../package.json');
const { configureProjects } = require('react-native-test-app');

module.exports = {
  project: configureProjects({
    android: {
      sourceDir: 'android',
    },
    ios: {
      sourceDir: 'ios',
    },
  }),
  dependencies: {
    [pak.name]: {
      root: path.join(__dirname, '..'),
    },
  },
};

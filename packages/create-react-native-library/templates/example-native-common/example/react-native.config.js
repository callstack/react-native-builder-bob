const path = require('path');
const pkg = require('../package.json');
<% if (example === 'test-app') { -%>
const { configureProjects } = require('react-native-test-app');
<% } -%>

module.exports = {
<% if (example === 'test-app') { -%>
  project: configureProjects({
    android: {
      sourceDir: 'android',
    },
    ios: {
      sourceDir: 'ios',
      automaticPodsInstallation: <%- experimentalSpm ? 'false' : 'true' %>,
    },
  }),
<% } else if (example === 'vanilla') { -%>
  project: {
    ios: {
      automaticPodsInstallation: <%- experimentalSpm ? 'false' : 'true' %>,
    },
  },
<% } -%>
  dependencies: {
    [pkg.name]: {
      root: path.join(__dirname, '..'),
      platforms: {
        // Codegen script incorrectly fails without this
        // So we explicitly specify the platforms with empty object
        ios: {},
        android: {},
      },
    },
  },
};

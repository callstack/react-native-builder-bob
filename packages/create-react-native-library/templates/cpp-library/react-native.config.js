/**
 * @type {import('@react-native-community/cli-types').UserDependencyConfig}
 */
module.exports = {
  dependency: {
    platforms: {
      android: {
        cxxModuleCMakeListsModuleName: '<%- project.identifier -%>',
        cxxModuleCMakeListsPath: 'CMakeLists.txt',
        cxxModuleHeaderName: '<%- project.name -%>Impl',
      },
    },
  },
};

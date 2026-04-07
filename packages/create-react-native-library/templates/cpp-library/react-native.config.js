/**
 * @type {import('@react-native-community/cli-types').UserDependencyConfig}
 */
module.exports = {
  dependency: {
    platforms: {
      android: {
        cmakeListsPath: 'generated/jni/CMakeLists.txt',
        cxxModuleCMakeListsModuleName: '<%- project.identifier -%>',
        cxxModuleCMakeListsPath: 'CMakeLists.txt',
        cxxModuleHeaderName: '<%- project.name -%>Impl',
      },
    },
  },
};

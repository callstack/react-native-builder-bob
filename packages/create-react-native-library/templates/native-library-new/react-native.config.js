/**
 * @type {import('@react-native-community/cli-types').UserDependencyConfig}
 */
module.exports = {
  dependency: {
    platforms: {
      android: {
        <%_ if (local) { -%>
        cmakeListsPath: 'build/generated/source/codegen/jni/CMakeLists.txt',
        <%_ } else { -%>
        cmakeListsPath: 'generated/jni/CMakeLists.txt',
        <%_ } -%>
      },
    },
  },
};

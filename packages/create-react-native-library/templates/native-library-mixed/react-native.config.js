/**
 * @type {import('@react-native-community/cli-types').UserDependencyConfig}
 */
module.exports = {
  dependency: {
    platforms: {
      android: {
        <%_ if (example === 'vanilla') { -%>
        cmakeListsPath: 'generated/jni/CMakeLists.txt',
        <%_ } else { -%>
        cmakeListsPath: 'build/generated/source/codegen/jni/CMakeLists.txt',
        <%_ } -%>
      },
    },
  },
};

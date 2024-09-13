/**
 * @type {import('@react-native-community/cli-types').UserDependencyConfig}
 */
module.exports = {
  dependency: {
    platforms: {
      android: {
        <% if (example === 'vanilla') { -%>
        cmakeListsPath: 'generated/jni/CMakeLists.txt',
        <% } else { -%>
        cmakeListsPath: 'build/generated/source/codegen/jni/CMakeLists.txt',
        <% } -%>
      },
    },
  },
};

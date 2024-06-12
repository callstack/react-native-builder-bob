module.exports = {
  dependency: {
    platforms: {
      /**
       * @type {import('@react-native-community/cli-types').AndroidDependencyParams}
       */
      android: {
        cmakeListsPath: 'generated/jni/CMakeLists.txt',
      },
    },
  },
};

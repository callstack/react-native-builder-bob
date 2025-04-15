module.exports = {
  presets: ['module:react-native-builder-bob/babel-preset'],
  overrides: [
    {
      include: /\/node_modules\//,
      presets: ['module:@react-native/babel-preset'],
    },
  ],
};

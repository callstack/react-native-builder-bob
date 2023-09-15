module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: { node: '18' },
      },
    ],
    '@babel/preset-typescript',
  ],
};

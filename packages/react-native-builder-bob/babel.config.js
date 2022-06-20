module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: { node: '16' },
      },
    ],
    '@babel/preset-typescript',
  ],
};

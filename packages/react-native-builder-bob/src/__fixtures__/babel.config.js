export default (api) => ({
  presets: [
    [
      '@babel/preset-env',
      {
        targets: { node: 'current' },
        modules: api.caller((caller) => caller?.supportsStaticESM)
          ? false
          : 'commonjs',
      },
    ],
    '@babel/preset-typescript',
  ],
});

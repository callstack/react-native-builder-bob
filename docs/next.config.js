const withNextra = require('nextra')({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.jsx',
});

let assetPrefix = '';
let basePath = '';

if (process.env.GITHUB_ACTIONS) {
  const repo = 'react-native-builder-bob';

  assetPrefix = `/${repo}/`;
  basePath = `/${repo}`;
}

module.exports = withNextra({
  output: 'export',
  images: {
    unoptimized: true,
  },
  assetPrefix,
  basePath,
});

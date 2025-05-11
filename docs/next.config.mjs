import nextra from 'nextra';

const withNextra = nextra({
  defaultShowCopyCode: true,
  mdxOptions: {
    rehypePrettyCodeOptions: {
      theme: {
        light: 'solarized-light',
        dark: 'catppuccin-frappe',
      },
    },
  },
});

let assetPrefix = '';
let basePath = '';

if (process.env.GITHUB_ACTIONS) {
  const repo = 'react-native-builder-bob';

  assetPrefix = `/${repo}/`;
  basePath = `/${repo}`;
}

export default withNextra({
  output: 'export',
  images: {
    unoptimized: true,
  },
  assetPrefix,
  basePath,
});

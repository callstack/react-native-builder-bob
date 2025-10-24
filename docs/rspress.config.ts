import { defineConfig } from '@rspress/core';
import { withCallstackPreset } from '@callstack/rspress-preset';

export default withCallstackPreset(
  {
    context: __dirname,
    docs: {
      title: 'Bob - Create and build React Native libraries',
      description:
        'Bob is a collection of tools to make it easier to build React Native libraries.',
      editUrl:
        'https://github.com/callstack/react-native-builder-bob/edit/main/docs/pages',
      rootUrl: 'https://oss.callstack.com/react-native-builder-bob',
      icon: 'assets/favicon.png',
      logoLight: 'construction_worker.png',
      logoDark: 'construction_worker.png',
      rootDir: 'pages',
      socials: {
        github: 'https://github.com/callstack/react-native-builder-bob',
      },
    },
  },
  defineConfig({
    themeConfig: {
      enableContentAnimation: false,
      sidebar: {
        '/': [
          { text: 'Scaffold a library', link: '/create' },
          { text: 'Build a library', link: '/build' },
          { text: 'ESM support', link: '/esm' },
          { text: 'FAQ', link: '/faq' },
        ],
      },
    },
  })
);

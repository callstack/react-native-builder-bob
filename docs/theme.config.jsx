import * as React from 'react';

export default {
  primaryHue: 30,
  logo: <span style={{ fontSize: '32px' }}>👷‍♂️</span>,
  project: {
    link: 'https://github.com/callstack/react-native-builder-bob',
  },
  docsRepositoryBase:
    'https://github.com/callstack/react-native-builder-bob/tree/main/docs',
  footer: {
    text: (
      <span>
        Copyright © {new Date().getFullYear()}{' '}
        <a href="https://www.callstack.com/" target="_blank" rel="noreferrer">
          Callstack Open Source
        </a>
        .
      </span>
    ),
  },
  useNextSeoProps() {
    return {
      titleTemplate: '%s – Bob',
    };
  },
};

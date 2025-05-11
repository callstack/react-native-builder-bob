import { Footer, Layout, Navbar } from 'nextra-theme-docs';
import { Head } from 'nextra/components';
import { getPageMap } from 'nextra/page-map';
import 'nextra-theme-docs/style.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s | Bob',
    default: 'Bob - Create and build React Native libraries with ease',
  },
};

const navbar = (
  <Navbar
    logo={<span style={{ fontSize: '32px' }}>👷‍♂️</span>}
    projectLink="https://github.com/callstack/react-native-builder-bob"
  />
);
const footer = (
  <Footer>
    Copyright © {new Date().getFullYear()}
    {' '}
    <a href="https://www.callstack.com/" target="_blank" rel="noreferrer">
      Callstack Open Source
    </a>
    .
  </Footer>
);

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <Head faviconGlyph="👷‍♂️" color={{ hue: 30 }}>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <body>
        <Layout
          navbar={navbar}
          pageMap={await getPageMap()}
          docsRepositoryBase="https://github.com/callstack/react-native-builder-bob/tree/main/docs"
          footer={footer}
        >
          {children}
        </Layout>
      </body>
    </html>
  );
}

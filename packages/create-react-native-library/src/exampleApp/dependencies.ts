import path from 'node:path';
import fs from 'fs-extra';
import sortObjectKeys from '../utils/sortObjectKeys.ts';

type PackageJson = {
  devDependencies?: Record<string, string>;
};

export async function alignDependencyVersionsWithExampleApp(
  pkg: PackageJson,
  folder: string
) {
  const examplePackageJson = await fs.readJSON(
    path.join(folder, 'example', 'package.json')
  );

  const PACKAGES_TO_COPY = [
    'react',
    'react-native',
    '@types/react',
    '@react-native/babel-preset',
  ];

  const devDependencies: Record<string, string> = {};

  PACKAGES_TO_COPY.forEach((name) => {
    if (name) {
      const version =
        examplePackageJson.dependencies?.[name] ??
        examplePackageJson.devDependencies?.[name];

      if (version != null) {
        devDependencies[name] = version;
      } else if (pkg.devDependencies?.[name] == null) {
        throw new Error(
          `Couldn't find the package "${name}" in the example app.`
        );
      }
    }
  });

  const reactNativeVersion = devDependencies['react-native'];

  // Packages under `@react-native/` are released together with `react-native`
  // So the ones not in the example app need to match its `react-native` version
  if (reactNativeVersion != null) {
    for (const name of Object.keys(pkg.devDependencies ?? {})) {
      if (name.startsWith('@react-native/') && devDependencies[name] == null) {
        devDependencies[name] = reactNativeVersion;
      }
    }
  }

  pkg['devDependencies'] = sortObjectKeys({
    ...pkg['devDependencies'],
    ...devDependencies,
  });
}

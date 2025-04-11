import path from 'path';
import fs from 'fs-extra';
import sortObjectKeys from '../utils/sortObjectKeys';

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

  pkg['devDependencies'] = sortObjectKeys({
    ...pkg['devDependencies'],
    ...devDependencies,
  });
}

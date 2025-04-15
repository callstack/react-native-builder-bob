import path from 'path';
import fs from 'fs-extra';
import type { TemplateConfiguration } from '../template';
import sortObjectKeys from '../utils/sortObjectKeys';

type PackageJson = {
  devDependencies?: Record<string, string>;
};

export async function alignDependencyVersionsWithExampleApp(
  pkg: PackageJson,
  folder: string,
  config: TemplateConfiguration
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

  if (
    config.example === 'vanilla' &&
    (config.project.moduleConfig === 'turbo-modules' ||
      config.project.viewConfig === 'fabric-view')
  ) {
    // React Native doesn't provide the community CLI as a dependency.
    // We have to read the version from the example app and put to the root package json
    PACKAGES_TO_COPY.push('@react-native-community/cli');
  }

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

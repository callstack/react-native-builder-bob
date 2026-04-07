import path from 'path';
import fs from 'fs-extra';
import sortObjectKeys from '../utils/sortObjectKeys';

type PackageJson = {
  devDependencies?: Record<string, string>;
  'react-native-builder-bob'?: {
    targets?: (string | [string, unknown])[];
  };
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

  const usesCodegen =
    pkg['react-native-builder-bob']?.targets?.some((target) =>
      Array.isArray(target) ? target[0] === 'codegen' : target === 'codegen'
    ) ?? false;

  if (usesCodegen) {
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

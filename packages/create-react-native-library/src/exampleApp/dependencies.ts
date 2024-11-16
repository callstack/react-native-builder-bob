import assert from 'node:assert';
import path from 'path';
import fs from 'fs-extra';
import type { ExampleApp } from '../input';

export async function getDependencyVersionsFromExample(
  folder: string,
  exampleAppType: ExampleApp
) {
  // Set `react` and `react-native` versions of root `package.json` from example `package.json`
  const examplePackageJson = await fs.readJSON(
    path.join(folder, 'example', 'package.json')
  );

  const react: string = examplePackageJson.dependencies?.react;
  assert(
    react !== undefined,
    "The generated example app doesn't have React installed."
  );
  const reactNative: string = examplePackageJson.dependencies?.['react-native'];
  assert(
    reactNative !== undefined,
    "The generated example app doesn't have React Native installed."
  );

  const devDependencies: Record<string, string> = {
    react,
    'react-native': reactNative,
  };

  if (exampleAppType === 'vanilla') {
    // React Native doesn't provide the community CLI as a dependency.
    // We have to get read the version from the example app and put to the root package json
    const exampleCommunityCLIVersion =
      examplePackageJson.devDependencies['@react-native-community/cli'];
    assert(
      exampleCommunityCLIVersion !== undefined,
      "The generated example app doesn't have community CLI installed"
    );

    devDependencies['@react-native-community/cli'] = exampleCommunityCLIVersion;
  }

  return {
    devDependencies,
  };
}

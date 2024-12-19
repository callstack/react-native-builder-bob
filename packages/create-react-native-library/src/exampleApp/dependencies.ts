import assert from 'node:assert';
import path from 'path';
import fs from 'fs-extra';
import type { TemplateConfiguration } from '../template';

export async function getDependencyVersionsFromExampleApp(
  folder: string,
  config: TemplateConfiguration
) {
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

  if (
    config.example === 'vanilla' &&
    (config.project.moduleConfig === 'turbo-modules' ||
      config.project.viewConfig === 'fabric-view')
  ) {
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

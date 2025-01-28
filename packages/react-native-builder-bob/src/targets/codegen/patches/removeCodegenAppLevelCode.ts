import fs from 'fs-extra';
import path from 'path';
import { CODEGEN_DOCS } from './patchCodegenAndroidPackage';

const FILES_TO_REMOVE = [
  'RCTAppDependencyProvider.h',
  'RCTAppDependencyProvider.mm',
  'RCTModulesConformingToProtocolsProvider.h',
  'RCTModulesConformingToProtocolsProvider.mm',
  'RCTThirdPartyComponentsProvider.h',
  'RCTThirdPartyComponentsProvider.mm',
  'ReactAppDependencyProvider.podspec',
];

/**
 * With React Native 0.77, calling `@react-native-community/cli codegen` generates
 * some app level source files such as `RCTAppDependencyProvider.mm`.
 * These files are supposed to be only generated for apps
 * but the cli misbehaves and generates them for all sorts of projects.
 * You can find the relevant PR here: https://github.com/facebook/react-native/pull/47650
 * This patch can be removed when this gets fixed in React Native.
 */
export async function removeCodegenAppLevelCode(
  projectPath: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  packageJson: any
) {
  const codegenAndroidPathSetting: string | undefined =
    packageJson.codegenConfig?.outputDir?.android;
  if (!codegenAndroidPathSetting) {
    throw new Error(
      `Your package.json doesn't contain codegenConfig.outputDir.android. Please see ${CODEGEN_DOCS}`
    );
  }
  const codegenAndroidPath = path.resolve(
    projectPath,
    codegenAndroidPathSetting
  );

  if (!(await fs.pathExists(codegenAndroidPath))) {
    throw new Error(
      `The codegen android path defined in your package.json: ${codegenAndroidPath} doesnt' exist.`
    );
  }

  const codegenIosPathSetting: string | undefined =
    packageJson.codegenConfig?.outputDir?.ios;
  if (!codegenIosPathSetting) {
    throw new Error(
      `Your package.json doesn't contain codegenConfig.outputDir.ios. Please see ${CODEGEN_DOCS}`
    );
  }
  const codegenIosPath = path.resolve(projectPath, codegenIosPathSetting);

  if (!(await fs.pathExists(codegenAndroidPath))) {
    throw new Error(
      `The codegen iOS path defined in your package.json: ${codegenIosPathSetting} doesnt' exist.`
    );
  }

  const androidPromises = FILES_TO_REMOVE.map((fileName) =>
    fs.rm(path.join(codegenAndroidPath, fileName))
  );

  const iosPromises = FILES_TO_REMOVE.map((fileName) =>
    fs.rm(path.join(codegenIosPath, fileName))
  );

  await Promise.allSettled([...androidPromises, ...iosPromises]);
}

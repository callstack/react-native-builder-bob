import dedent from 'dedent';
import fs from 'fs-extra';
import { getLatestVersion } from 'get-latest-version';
import kleur from 'kleur';
import path from 'path';
import {
  SUPPORTED_EXPO_SDK_VERSION,
  SUPPORTED_MONOREPO_CONFIG_VERSION,
  SUPPORTED_REACT_NATIVE_VERSION,
} from '../constants';
import type { TemplateConfiguration } from '../template';
import sortObjectKeys from '../utils/sortObjectKeys';
import { spawn } from '../utils/spawn';

const FILES_TO_DELETE = [
  '__tests__',
  '.buckconfig',
  '.eslintrc.js',
  '.flowconfig',
  '.git',
  '.gitignore',
  '.prettierrc.js',
  'App.js',
  'App.tsx',
  'index.js',
  'tsconfig.json',
];

const PACKAGES_TO_REMOVE = [
  '@react-native/eslint-config',
  '@react-native/new-app-screen',
  '@tsconfig/react-native',
  '@types/jest',
  '@types/react-test-renderer',
  '@typescript-eslint/eslint-plugin',
  '@typescript-eslint/parser',
  'babel-jest',
  'eslint',
  'jest',
  'prettier',
  'react-test-renderer',
  'typescript',
  'react-native-safe-area-context',
];

const PACKAGES_TO_ADD_EXPO_WEB = {
  '@expo/metro-runtime': '~5.0.4',
  'react-native-web': '~0.21.1',
};

const PACKAGES_TO_ADD_DEV_EXPO_NATIVE = {
  'expo-dev-client': '~5.0.3',
};

async function fetchReactNativeVersion(version: string) {
  const matchedReactNativeVersion = /(\d+\.\d+[-.0-9a-z]*)/.test(version)
    ? version
    : await getLatestVersion('react-native', {
        range: version,
      });

  if (!matchedReactNativeVersion) {
    throw new Error(
      `Could not find a matching version for react-native: ${version}`
    );
  }

  return matchedReactNativeVersion;
}

async function fetchCompatibleExpoSDK(reactNativeVersion: string) {
  const matchedReactNativeVersion =
    await fetchReactNativeVersion(reactNativeVersion);

  const res = await fetch('https://api.expo.dev/v2/versions/latest');

  if (!res.ok) {
    throw new Error(
      `Failed to fetch Expo SDK versions: ${String(res.status)} ${res.statusText}`
    );
  }

  const result = await res.json();

  const sdkVersion = Object.entries(result.data.sdkVersions)
    .find(([, sdkVersionInfo]) => {
      if (
        typeof sdkVersionInfo === 'object' &&
        sdkVersionInfo != null &&
        'facebookReactNativeVersion' in sdkVersionInfo &&
        typeof sdkVersionInfo.facebookReactNativeVersion === 'string'
      ) {
        const requested = matchedReactNativeVersion.split('.');
        const supported = sdkVersionInfo.facebookReactNativeVersion.split('.');

        return (
          requested[0] === supported[0] &&
          requested[1] === supported[1] &&
          (requested[2] ? requested[2] === supported[2] : true)
        );
      }

      return false;
    })?.[0]
    // Get major SDK version (e.g. "55" from "55.0.0")
    .split('.')[0];

  if (sdkVersion == null) {
    throw new Error(
      `Couldn't find a compatible Expo SDK for react-native@${reactNativeVersion}`
    );
  }

  return {
    sdkVersion,
    reactNativeVersion: matchedReactNativeVersion,
  };
}

export default async function generateExampleApp({
  config,
  root,
  reactNativeVersion,
}: {
  config: TemplateConfiguration;
  root: string;
  reactNativeVersion: string | undefined;
}) {
  const directory = path.join(root, 'example');

  let args: string[] = [];

  switch (config.example) {
    case 'vanilla':
      if (
        reactNativeVersion != null &&
        reactNativeVersion !== SUPPORTED_REACT_NATIVE_VERSION
      ) {
        console.log(
          `${kleur.blue('ℹ')} Using untested ${kleur.cyan(
            `react-native@${reactNativeVersion}`
          )} for the example`
        );
      }

      // `npx @react-native-community/cli init <projectName> --directory example --skip-install`
      args = [
        `@react-native-community/cli`,
        'init',
        `${config.project.name}Example`,
        '--package-name',
        `${config.project.package}.example`,
        '--directory',
        directory,
        '--version',
        reactNativeVersion || SUPPORTED_REACT_NATIVE_VERSION,
        '--skip-install',
        '--skip-git-init',
        '--pm',
        'npm',
      ];
      break;
    case 'test-app':
      {
        // Test App doesn't support a semver range for the version
        const matchedReactNativeVersion = reactNativeVersion
          ? await fetchReactNativeVersion(reactNativeVersion)
          : SUPPORTED_REACT_NATIVE_VERSION;

        if (
          reactNativeVersion != null &&
          reactNativeVersion !== SUPPORTED_REACT_NATIVE_VERSION
        ) {
          console.log(
            `${kleur.blue('ℹ')} Using untested ${kleur.cyan(
              `react-native@${matchedReactNativeVersion}`
            )} for the example`
          );
        }

        // `npx --package react-native-test-app@latest init --name ${projectName}Example --destination example --version ${reactNativeVersion}`
        args = [
          '--package',
          `react-native-test-app@latest`,
          'init',
          '--name',
          `${config.project.name}Example`,
          `--destination`,
          directory,
          '--version',
          matchedReactNativeVersion,
          '--platform',
          'ios',
          '--platform',
          'android',
        ];
      }
      break;
    case 'expo': {
      // `npx create-expo-app example --no-install --template blank`
      const { sdkVersion, reactNativeVersion: matchedReactNativeVersion } =
        reactNativeVersion
          ? await fetchCompatibleExpoSDK(reactNativeVersion)
          : {
              sdkVersion: SUPPORTED_EXPO_SDK_VERSION,
              reactNativeVersion: null,
            };

      if (
        sdkVersion !== SUPPORTED_EXPO_SDK_VERSION &&
        matchedReactNativeVersion
      ) {
        console.log(
          `${kleur.blue('ℹ')} Using untested ${kleur.cyan(
            `expo@${sdkVersion}`
          )} with ${kleur.cyan(`react-native@${matchedReactNativeVersion}`)} for the example`
        );
      }

      args = [
        'create-expo-app@latest',
        directory,
        '--no-install',
        '--template',
        `blank@sdk-${sdkVersion}`,
      ];
      break;
    }
    case undefined:
    case null: {
      // Do nothing
    }
  }

  await spawn('npx', args, {
    env: { ...process.env, npm_config_yes: 'true' },
  });

  // Remove unnecessary files and folders
  for (const file of FILES_TO_DELETE) {
    await fs.remove(path.join(directory, file));
  }

  // Patch the example app's package.json
  const pkg = await fs.readJSON(path.join(directory, 'package.json'));

  pkg.name = `${config.project.slug}-example`;

  // Remove Jest config for now
  delete pkg.jest;

  // Make sure we have at least empty objects
  // Otherwise generation will fails if package doesn't contain these fields
  pkg.scripts = pkg.scripts || {};
  pkg.dependencies = pkg.dependencies || {};
  pkg.devDependencies = pkg.devDependencies || {};

  const { scripts, dependencies, devDependencies } = pkg;

  delete scripts.test;
  delete scripts.lint;

  const SCRIPTS_TO_ADD =
    config.example === 'expo'
      ? {
          'build:ios': `xcodebuild ONLY_ACTIVE_ARCH=YES -workspace ios/${config.project.name}Example.xcworkspace -UseNewBuildSystem=YES -scheme ${config.project.name}Example -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build -quiet`,
          'build:android':
            'cd android && ./gradlew assembleDebug -DtestBuildType=debug -Dorg.gradle.jvmargs=-Xmx4g',
        }
      : {
          'build:android':
            'react-native build-android --extra-params "--no-daemon --console=plain -PreactNativeArchitectures=arm64-v8a"',
          'build:ios': `react-native build-ios --mode Debug`,
        };

  if (config.example != null) {
    Object.assign(scripts, SCRIPTS_TO_ADD);
  }

  if (config.example === 'test-app') {
    // `react-native-test-app` doesn't bundle application by default in 'Release' mode and also `bundle` command doesn't create a directory.
    // `mkdist` script should be removed after stable React Native major contains this fix: https://github.com/facebook/react-native/pull/45182.

    const androidBuild = [
      'npm run mkdist',
      'react-native bundle --entry-file index.js --platform android --dev true --bundle-output dist/main.android.jsbundle --assets-dest dist',
      SCRIPTS_TO_ADD['build:android'],
    ].join(' && ');

    const iosBuild = [
      'npm run mkdist',
      'react-native bundle --entry-file index.js --platform ios --dev true --bundle-output dist/main.ios.jsbundle --assets-dest dist',
      SCRIPTS_TO_ADD['build:ios'],
    ].join(' && ');

    Object.assign(scripts, {
      'build:android': androidBuild,
      'build:ios': iosBuild,
    });

    const app = await fs.readJSON(path.join(directory, 'app.json'));

    app.android = app.android || {};
    app.android.package = `${config.project.package}.example`;
    app.ios = app.ios || {};
    app.ios.bundleIdentifier = `${config.project.package}.example`;

    await fs.writeJSON(path.join(directory, 'app.json'), app, {
      spaces: 2,
    });
  }

  PACKAGES_TO_REMOVE.forEach((name) => {
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete devDependencies[name];
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete dependencies[name];
  });

  const PACKAGES_TO_ADD_DEV = {
    'react-native-builder-bob': `^${config.versions.bob}`,
    'react-native-monorepo-config': `^${SUPPORTED_MONOREPO_CONFIG_VERSION}`,
  };

  if (
    config.project.moduleConfig === 'nitro-modules' ||
    config.project.viewConfig === 'nitro-view'
  ) {
    const packagesToAddNitro = {
      'react-native-nitro-modules': `^${config.versions.nitro || 'latest'}`,
    };

    Object.assign(dependencies, packagesToAddNitro);
  }

  Object.assign(devDependencies, PACKAGES_TO_ADD_DEV);

  if (config.example === 'expo') {
    const sdkVersion: string = dependencies.expo
      .split('.')[0]
      .replace(/[^\d]/, '');

    let bundledNativeModules: Record<string, string>;

    try {
      const res = await fetch(
        `https://raw.githubusercontent.com/expo/expo/sdk-${sdkVersion}/packages/expo/bundledNativeModules.json`
      );

      if (!res.ok) {
        throw new Error(
          `Failed to fetch bundled native modules for Expo SDK ${sdkVersion}: ${String(res.status)} ${res.statusText}`
        );
      }

      bundledNativeModules = await res.json();
    } catch (e) {
      console.warn(
        `${kleur.yellow(
          '⚠'
        )} Failed to fetch compatibility data for Expo SDK ${sdkVersion}: ${kleur.cyan(
          config.example
        )}`
      );

      bundledNativeModules = {};
    }

    if (config.project.native) {
      Object.entries(PACKAGES_TO_ADD_DEV_EXPO_NATIVE).forEach(
        ([name, version]) => {
          devDependencies[name] = bundledNativeModules[name] || version;
        }
      );

      scripts.start = 'expo start --dev-client';
      scripts.android = 'expo run:android';
      scripts.ios = 'expo run:ios';

      await fs.writeFile(
        path.join(directory, '.gitignore'),
        dedent`
        # These folders are generated with prebuild (CNG)
        android/
        ios/
        `
      );
    }

    const reactVersion = dependencies.react ?? devDependencies.react;

    if (typeof reactVersion !== 'string') {
      throw new Error("Couldn't find the package 'react' in the example app.");
    }

    Object.entries(PACKAGES_TO_ADD_EXPO_WEB).forEach(([name, version]) => {
      dependencies[name] = bundledNativeModules[name] || version;
    });

    dependencies['react-dom'] = reactVersion;
    scripts.web = 'expo start --web';
    scripts['build:web'] = 'expo export --platform web';

    const app = await fs.readJSON(path.join(directory, 'app.json'));

    app.expo.name = `${config.project.name} Example`;
    app.expo.slug = `${config.project.slug}-example`;
    app.expo.android = app.expo.android || {};
    app.expo.android.package = `${config.project.package}.example`;
    app.expo.ios = app.expo.ios || {};
    app.expo.ios.bundleIdentifier = `${config.project.package}.example`;

    await fs.writeJSON(path.join(directory, 'app.json'), app, {
      spaces: 2,
    });
  }

  // Sort the deps by name to match behavior of package managers
  // This way the package.json doesn't get updated when installing deps
  for (const field of ['dependencies', 'devDependencies']) {
    if (pkg[field]) {
      pkg[field] = sortObjectKeys(pkg[field]);
    }
  }

  await fs.writeJSON(path.join(directory, 'package.json'), pkg, {
    spaces: 2,
  });

  if (config.example === 'vanilla' && config.project.cpp) {
    const podfile = await fs.readFile(
      path.join(directory, 'ios', 'Podfile'),
      'utf8'
    );

    await fs.writeFile(
      path.join(directory, 'ios', 'Podfile'),
      "ENV['RCT_USE_RN_DEP'] = '1' # Needed to make iOS build work for C++ module\n\n" +
        podfile
    );
  }
}

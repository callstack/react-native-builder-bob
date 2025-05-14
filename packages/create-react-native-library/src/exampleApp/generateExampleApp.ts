import fs from 'fs-extra';
import getLatestVersion from 'get-latest-version';
import https from 'https';
import path from 'path';
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
];

const PACKAGES_TO_ADD_WEB = {
  '@expo/metro-runtime': '~3.2.1',
  'react-dom': '18.2.0',
  'react-native-web': '~0.18.10',
};

export default async function generateExampleApp({
  config,
  root,
  reactNativeVersion = 'latest',
}: {
  config: TemplateConfiguration;
  root: string;
  reactNativeVersion?: string;
}) {
  const directory = path.join(root, 'example');

  let args: string[] = [];

  switch (config.example) {
    case 'vanilla':
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
        reactNativeVersion,
        '--skip-install',
        '--pm',
        'npm',
      ];
      break;
    case 'test-app':
      {
        // Test App requires React Native version to be a semver version
        const matchedReactNativeVersion = /(\d+\.\d+[-.0-9a-z]*)/.test(
          reactNativeVersion
        )
          ? reactNativeVersion
          : await getLatestVersion('react-native', {
              range: reactNativeVersion,
            });

        if (!matchedReactNativeVersion) {
          throw new Error(
            `Could not find a matching version for react-native: ${reactNativeVersion}`
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
    case 'expo':
      // `npx create-expo-app example --no-install --template blank`
      args = [
        'create-expo-app@latest',
        directory,
        '--no-install',
        '--template',
        'blank',
      ];
      break;
    case 'none': {
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

  const { scripts, dependencies, devDependencies } = pkg;

  delete scripts.test;
  delete scripts.lint;

  const SCRIPTS_TO_ADD = {
    'build:android':
      'react-native build-android --extra-params "--no-daemon --console=plain -PreactNativeArchitectures=arm64-v8a"',
    'build:ios': `react-native build-ios --mode Debug`,
  };

  if (config.example === 'vanilla') {
    Object.assign(scripts, SCRIPTS_TO_ADD);
  } else if (config.example === 'test-app') {
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
  });

  const PACKAGES_TO_ADD_DEV = {
    'react-native-builder-bob': `^${config.versions.bob}`,
  };

  if (config.project.moduleConfig === 'nitro-modules') {
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
      bundledNativeModules = await new Promise((resolve, reject) => {
        https
          .get(
            `https://raw.githubusercontent.com/expo/expo/sdk-${sdkVersion}/packages/expo/bundledNativeModules.json`,
            (res) => {
              let data = '';

              res.on('data', (chunk: string) => (data += chunk));
              res.on('end', () => {
                try {
                  resolve(JSON.parse(data));
                } catch (e) {
                  // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
                  reject(e);
                }
              });
            }
          )
          .on('error', reject);
      });
    } catch (e) {
      bundledNativeModules = {};
    }

    Object.entries(PACKAGES_TO_ADD_WEB).forEach(([name, version]) => {
      dependencies[name] = bundledNativeModules[name] || version;
    });

    scripts.web = 'expo start --web';

    const app = await fs.readJSON(path.join(directory, 'app.json'));

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

  if (config.example !== 'expo') {
    let gradleProperties = await fs.readFile(
      path.join(directory, 'android', 'gradle.properties'),
      'utf8'
    );

    // Disable Jetifier.
    // Remove this when the app template is updated.
    gradleProperties = gradleProperties.replace(
      'android.enableJetifier=true',
      'android.enableJetifier=false'
    );

    // Enable new arch for iOS and Android
    // iOS
    // Add ENV['RCT_NEW_ARCH_ENABLED'] = 1 on top of example/ios/Podfile
    const podfile = await fs.readFile(
      path.join(directory, 'ios', 'Podfile'),
      'utf8'
    );

    await fs.writeFile(
      path.join(directory, 'ios', 'Podfile'),
      "ENV['RCT_NEW_ARCH_ENABLED'] = '1'\n\n" + podfile
    );

    // Android
    // Make sure newArchEnabled=true is present in android/gradle.properties
    if (gradleProperties.split('\n').includes('#newArchEnabled=true')) {
      gradleProperties = gradleProperties.replace(
        '#newArchEnabled=true',
        'newArchEnabled=true'
      );
    } else if (gradleProperties.split('\n').includes('newArchEnabled=false')) {
      gradleProperties = gradleProperties.replace(
        'newArchEnabled=false',
        'newArchEnabled=true'
      );
    } else if (!gradleProperties.split('\n').includes('newArchEnabled=true')) {
      gradleProperties += '\nnewArchEnabled=true';
    }

    await fs.writeFile(
      path.join(directory, 'android', 'gradle.properties'),
      gradleProperties
    );
  }
}

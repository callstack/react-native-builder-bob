import fs from 'fs-extra';
import path from 'path';
import https from 'https';
import { spawn } from './spawn';

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
  '@types/react',
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

const PACKAGES_TO_ADD_DEV = {
  'babel-plugin-module-resolver': '^5.0.0',
};

const PACKAGES_TO_ADD_WEB = {
  '@expo/metro-runtime': '~3.2.1',
  'react-dom': '18.2.0',
  'react-native-web': '~0.18.10',
};

export default async function generateExampleApp({
  type,
  dest,
  slug,
  projectName,
  arch,
  reactNativeVersion = 'latest',
}: {
  type: 'expo' | 'native';
  dest: string;
  slug: string;
  projectName: string;
  arch: 'new' | 'mixed' | 'legacy';
  reactNativeVersion?: string;
}) {
  const directory = path.join(dest, 'example');
  const args =
    type === 'native'
      ? // `npx react-native init <projectName> --directory example --skip-install`
        [
          `react-native@${reactNativeVersion}`,
          'init',
          `${projectName}Example`,
          '--directory',
          directory,
          '--version',
          reactNativeVersion,
          '--skip-install',
          '--npm',
        ]
      : // `npx create-expo-app example --no-install --template blank`
        [
          'create-expo-app@latest',
          directory,
          '--no-install',
          '--template',
          'blank',
        ];

  await spawn('npx', args, {
    cwd: dest,
    env: { ...process.env, npm_config_yes: 'true' },
  });

  // Remove unnecessary files and folders
  for (const file of FILES_TO_DELETE) {
    await fs.remove(path.join(directory, file));
  }

  // Patch the example app's package.json
  const pkg = JSON.parse(
    await fs.readFile(path.join(directory, 'package.json'), 'utf8')
  );

  pkg.name = `${slug}-example`;

  // Remove Jest config for now
  delete pkg.jest;

  const { scripts, dependencies, devDependencies } = pkg;

  delete scripts.test;
  delete scripts.lint;

  const SCRIPTS_TO_ADD = {
    'build:android':
      'react-native build-android --extra-params "--no-daemon --console=plain -PreactNativeArchitectures=arm64-v8a"',
    'build:ios': `react-native build-ios --scheme ${projectName}Example --mode Debug --extra-params "-sdk iphonesimulator CC=clang CPLUSPLUS=clang++ LD=clang LDPLUSPLUS=clang++ GCC_OPTIMIZATION_LEVEL=0 GCC_PRECOMPILE_PREFIX_HEADER=YES ASSETCATALOG_COMPILER_OPTIMIZATION=time DEBUG_INFORMATION_FORMAT=dwarf COMPILER_INDEX_STORE_ENABLE=NO"`,
  };

  if (type === 'native') {
    Object.assign(scripts, SCRIPTS_TO_ADD);
  }

  PACKAGES_TO_REMOVE.forEach((name) => {
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete devDependencies[name];
  });

  Object.assign(devDependencies, PACKAGES_TO_ADD_DEV);

  if (type === 'expo') {
    const sdkVersion = dependencies.expo.split('.')[0].replace(/[^\d]/, '');

    let bundledNativeModules: Record<string, string>;

    try {
      bundledNativeModules = await new Promise((resolve, reject) => {
        https
          .get(
            `https://raw.githubusercontent.com/expo/expo/sdk-${sdkVersion}/packages/expo/bundledNativeModules.json`,
            (res) => {
              let data = '';

              res.on('data', (chunk) => (data += chunk));
              res.on('end', () => {
                try {
                  resolve(JSON.parse(data));
                } catch (e) {
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
  }

  await fs.writeJSON(path.join(directory, 'package.json'), pkg, {
    spaces: 2,
  });

  if (type === 'native') {
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

    // If the library is on new architecture, enable new arch for iOS and Android
    if (arch === 'new') {
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
      // Change newArchEnabled=false to newArchEnabled=true in example/android/gradle.properties
      gradleProperties = gradleProperties.replace(
        'newArchEnabled=false',
        'newArchEnabled=true'
      );
    }

    await fs.writeFile(
      path.join(directory, 'android', 'gradle.properties'),
      gradleProperties
    );
  }
}

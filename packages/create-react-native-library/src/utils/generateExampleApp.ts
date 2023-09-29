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
  'react-dom': '18.2.0',
  'react-native-web': '~0.18.10',
};

const PACKAGES_TO_ADD_WEB_DEV = {
  '@expo/webpack-config': '^18.0.1',
  'babel-loader': '^8.1.0',
};

const PACKAGES_TO_ADD_NATIVE_DEV = {
  'pod-install': '^0.1.0',
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
          'react-native@latest',
          'init',
          `${projectName}Example`,
          '--directory',
          directory,
          '--version',
          reactNativeVersion,
          '--skip-install',
        ]
      : // `npx create-expo-app example --no-install`
        ['create-expo-app@latest', directory, '--no-install'];

  if (type === 'native') {
    if (!process.env.USE_YARN) {
      console.debug('Using React Native CLI with npm to create example app');
      args.push('--npm');
    } else {
      console.debug('Using React Native CLI with Yarn to create example app');
    }
  }

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
      'cd android && ./gradlew assembleDebug --no-daemon --console=plain -PreactNativeArchitectures=arm64-v8a',
    'build:ios': `cd ios && xcodebuild -workspace ${projectName}Example.xcworkspace -scheme ${projectName}Example -configuration Debug -sdk iphonesimulator CC=clang CPLUSPLUS=clang++ LD=clang LDPLUSPLUS=clang++ GCC_OPTIMIZATION_LEVEL=0 GCC_PRECOMPILE_PREFIX_HEADER=YES ASSETCATALOG_COMPILER_OPTIMIZATION=time DEBUG_INFORMATION_FORMAT=dwarf COMPILER_INDEX_STORE_ENABLE=NO`,
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

    Object.entries(PACKAGES_TO_ADD_WEB_DEV).forEach(([name, version]) => {
      devDependencies[name] = bundledNativeModules[name] || version;
    });

    scripts.web = 'expo start --web';
  } else {
    Object.assign(devDependencies, PACKAGES_TO_ADD_NATIVE_DEV);
  }

  await fs.writeJSON(path.join(directory, 'package.json'), pkg, {
    spaces: 2,
  });

  // If the library is on new architecture, enable new arch for iOS and Android
  if (arch === 'new') {
    // Android
    // Change newArchEnabled=false to newArchEnabled=true in example/android/gradle.properties
    const gradleProperties = await fs.readFile(
      path.join(directory, 'android', 'gradle.properties'),
      'utf8'
    );

    await fs.writeFile(
      path.join(directory, 'android', 'gradle.properties'),
      gradleProperties.replace('newArchEnabled=false', 'newArchEnabled=true')
    );

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
  }
}

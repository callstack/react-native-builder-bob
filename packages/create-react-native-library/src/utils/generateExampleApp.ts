import fs from 'fs-extra';
import spawn from 'cross-spawn';
import path from 'path';

const FILES_TO_DELETE = [
  '__tests__',
  '.buckconfig',
  '.eslintrc.js',
  '.flowconfig',
  '.git',
  '.gitignore',
  '.prettierrc.js',
  'App.js',
  'index.js',
];

const PACKAGES_TO_REMOVE = [
  '@react-native-community/eslint-config',
  'babel-jest',
  'eslint',
  'jest',
  'react-test-renderer',
];

const PACKAGES_TO_ADD = {
  'babel-plugin-module-resolver': '^4.1.0',
};

export default async function generateExampleApp({
  type,
  dest,
  projectName,
  architecture,
  reactNativeVersion = 'latest',
}: {
  type: 'expo' | 'native';
  dest: string;
  projectName: string;
  architecture: 'new' | 'mixed' | 'legacy';
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

  const child = spawn('npx', ['--yes', ...args], {
    cwd: dest,
  });

  await new Promise((resolve, reject) => {
    child.once('error', reject);
    child.once('close', resolve);
  });

  // Remove unnecessary files and folders
  for (const file of FILES_TO_DELETE) {
    await fs.remove(path.join(directory, file));
  }

  // Patch the example app's package.json
  const pkg = JSON.parse(
    await fs.readFile(path.join(directory, 'package.json'), 'utf8')
  );

  // Remove Jest config for now
  delete pkg.jest;

  const { scripts, devDependencies } = pkg;

  delete scripts.test;
  delete scripts.lint;

  if (type === 'native') {
    scripts.pods = 'pod-install --quiet';
  }

  PACKAGES_TO_REMOVE.forEach((pkg) => {
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete devDependencies[pkg];
  });

  Object.assign(devDependencies, PACKAGES_TO_ADD);

  await fs.writeFile(
    path.join(directory, 'package.json'),
    JSON.stringify(pkg, null, 2)
  );

  // If the library is on new architecture, enable new arch for iOS and Android
  if (architecture === 'new') {
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

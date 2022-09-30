import fs from 'fs';
import spawn from 'cross-spawn';
import path from 'path';

const FILES_TO_DELETE = [
  '.eslintrc.js',
  '.gitignore',
  '.prettierrc.js',
  'App.js',
  'index.js',
  '.flowconfig',
  '.buckconfig',
];

const FOLDERS_TO_DELETE = ['__tests__'];

const PACKAGES_TO_REMOVE = [
  '@react-native-community/eslint-config',
  'babel-jest',
  'eslint',
  'jest',
  'react-test-renderer',
];

const PACKAGES_TO_ADD = {
  'babel-plugin-module-resolver': '^4.1.0',
  'metro-react-native-babel-preset': '^0.72.1',
  'patch-package': '^6.4.7',
  'postinstall-postinstall': '^2.1.0',
};

export default async function generateRNApp({
  dest,
  projectName,
  isNewArch,
}: {
  dest: string;
  projectName: string;
  isNewArch: boolean;
}) {
  // Generate the example app's base using `npx react-native init <projectName>Example --directory example --skip-install`
  const createRNAppProcess = spawn(
    'npx',
    [
      'react-native',
      'init',
      `${projectName}Example`,
      '--directory',
      path.join(dest, 'example'),
      '--skip-install',
    ],
    {
      cwd: dest,
    }
  );
  await new Promise((resolve, reject) => {
    createRNAppProcess.once('error', reject);
    createRNAppProcess.once('close', resolve);
  });

  // Remove unnecessary files
  FILES_TO_DELETE.forEach((file) => {
    try {
      fs.unlinkSync(path.join(dest, 'example', file));
    } catch (e) {
      //ignore
    }
  });

  // Remove unnecessary folders
  FOLDERS_TO_DELETE.forEach((folder) => {
    try {
      fs.rmSync(path.join(dest, 'example', folder), {
        recursive: true,
      });
    } catch (e) {
      // ignore
    }
  });

  // Patch the example app's package.json
  const examplePackageJson = JSON.parse(
    fs.readFileSync(path.join(dest, 'example', 'package.json'), 'utf8')
  );
  examplePackageJson.scripts = {
    ...examplePackageJson.scripts,
    test: undefined,
    lint: undefined,

    pods: 'pod-install --quiet',
    postinstall: 'patch-package',
  };
  PACKAGES_TO_REMOVE.forEach((pkg) => {
    examplePackageJson.devDependencies[pkg] = undefined;
  });
  examplePackageJson.devDependencies = {
    ...examplePackageJson.devDependencies,
    ...PACKAGES_TO_ADD,
  };
  examplePackageJson.jest = undefined;
  fs.writeFileSync(
    path.join(dest, 'example', 'package.json'),
    JSON.stringify(examplePackageJson, null, 2)
  );

  // If the library is on new architecture, enable new arch for IOS and Android
  if (isNewArch) {
    // Android
    // Change newArchEnabled=false to newArchEnabled=true in example/android/gradle.properties
    const gradleProperties = fs
      .readFileSync(
        path.join(dest, 'example', 'android', 'gradle.properties'),
        'utf8'
      )
      .replace('newArchEnabled=false', 'newArchEnabled=true');
    fs.writeFileSync(
      path.join(dest, 'example', 'android', 'gradle.properties'),
      gradleProperties
    );

    // IOS
    // Add ENV['RCT_NEW_ARCH_ENABLED'] = 1 on top of example/ios/Podfile
    const podfile = fs.readFileSync(
      path.join(dest, 'example', 'ios', 'Podfile'),
      'utf8'
    );
    fs.writeFileSync(
      path.join(dest, 'example', 'ios', 'Podfile'),
      "ENV['RCT_NEW_ARCH_ENABLED'] = '1'\n" + podfile
    );
  }
}

import fs from 'fs';
import spawn from 'cross-spawn';
import path from 'path';

export function generateRNApp({
  dest,
  projectName,
  version,
}: {
  dest: string;
  projectName: string;
  version: string;
}) {
  // Generate the example app's base using `npx react-native init <projectName>Example --template react-native-template-typescript --directory example --skip-install --version <version>`
  const createRNAppProcess = spawn.sync(
    'npx',
    [
      'react-native',
      'init',
      `${projectName}Example`,
      '--template',
      'react-native-template-typescript',
      '--directory',
      path.join(dest, 'example'),
      '--skip-install',
      '--version',
      version,
    ],
    {
      cwd: dest,
    }
  );
  if (createRNAppProcess.error) {
    throw createRNAppProcess.error;
  }

  // Remove unnecessary files
  [
    '.eslintrc.js',
    'tsconfig.json',
    '.gitignore',
    '.git',
    '.prettierrc.js',
    'index.js',
    'App.tsx',
  ].forEach((file) => {
    try {
      fs.unlinkSync(path.join(dest, 'example', file));
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
  examplePackageJson.devDependencies = {
    ...examplePackageJson.devDependencies,
    '@react-native-community/eslint-config': undefined,
    '@tsconfig/react-native': undefined,
    '@types/jest': undefined,
    '@types/react-native': undefined,
    '@types/react-test-renderer': undefined,
    '@typescript-eslint/eslint-plugin': undefined,
    '@typescript-eslint/parser': undefined,
    'babel-jest': undefined,
    'eslint': undefined,
    'jest': undefined,
    'react-test-renderer': undefined,
    'typescript': undefined,

    'babel-plugin-module-resolver': '^4.1.0',
    'metro-react-native-babel-preset': '^0.72.1',
    'patch-package': '^6.4.7',
    'postinstall-postinstall': '^2.1.0',
  };
  examplePackageJson.jest = undefined;
  fs.writeFileSync(
    path.join(dest, 'example', 'package.json'),
    JSON.stringify(examplePackageJson, null, 2)
  );
}

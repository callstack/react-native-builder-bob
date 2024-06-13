const fs = require('fs');
const path = require('path');

/**
 * Currently, running react-native codegen generates java files with package name `com.facebook.fbreact.specs`.
 * This is a known issue in react-native itself.
 * You can find the relevant line here: https://github.com/facebook/react-native/blob/dc460147bb00d6f912cc0a829f8040d85faeeb13/packages/react-native/scripts/codegen/generate-artifacts-executor.js#L459.
 * To workaround, we are renaming the package name to the one provided in the codegenConfig.
 */

const packageJsonPath = path.resolve(__dirname, '../package.json');
const packageJson = require(packageJsonPath);

const codegenAndroidPath = packageJson.codegenConfig.outputDir.android;
console.assert(codegenAndroidPath, 'codegenAndroidPath is required');

const codegenJavaPackageName =
  packageJson.codegenConfig.android.javaPackageName;
console.assert(codegenJavaPackageName, 'codegenJavaPackageName is required');

const codegenJavaPath = path.resolve(
  __dirname,
  `../${codegenAndroidPath}/java/com/facebook/fbreact/specs`
);

// 1. Get all the java files
const javaFiles = fs.readdirSync(codegenJavaPath);

javaFiles.forEach((file) => {
  const filePath = path.resolve(codegenJavaPath, file);
  const fileContent = fs.readFileSync(filePath, 'utf8');

  // 2. Rename the package name with the desired package name
  const newFileContent = fileContent.replace(
    /package com.facebook.fbreact.specs/,
    `package ${codegenJavaPackageName}`
  );

  fs.writeFileSync(filePath, newFileContent);
});

// 3. Move the files to the new package path
const newPackagePath = path.resolve(
  __dirname,
  `../${codegenAndroidPath}/java/${codegenJavaPackageName.replace(/\./g, '/')}`
);

if (!fs.existsSync(newPackagePath)) {
  fs.mkdirSync(newPackagePath, { recursive: true });
}

javaFiles.forEach((file) => {
  const filePath = path.resolve(codegenJavaPath, file);
  const newFilePath = path.resolve(newPackagePath, file);

  fs.renameSync(filePath, newFilePath);
});

// 4. Remove the old package path
fs.rmdirSync(
  path.resolve(__dirname, `../${codegenAndroidPath}/java/com/facebook`),
  { force: true, recursive: true }
);

console.log('Java package name updated successfully');

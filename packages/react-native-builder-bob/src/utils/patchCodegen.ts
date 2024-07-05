import fs from 'fs-extra';
import path from 'path';

/**
 * Currently, running react-native codegen generates java files with package name `com.facebook.fbreact.specs`.
 * This is a known issue in react-native itself.
 * You can find the relevant line here: https://github.com/facebook/react-native/blob/dc460147bb00d6f912cc0a829f8040d85faeeb13/packages/react-native/scripts/codegen/generate-artifacts-executor.js#L459.
 * To workaround, this function renames the package name to the one provided in the codegenConfig.
 * @throws if codegenConfig.outputDir.android or codegenConfig.android.javaPackageName is not defined in package.json
 * @throws if the codegenAndroidPath does not exist
 */
export async function patchCodegen(projectPath: string) {
  const packageJsonPath = path.resolve(projectPath, 'package.json');
  const packageJson = await fs.readJson(packageJsonPath);

  let codegenAndroidPath: string | undefined =
    packageJson.codegenConfig.outputDir.android;
  if (!codegenAndroidPath) {
    throw new Error(
      'You need to define codegenConfig.outputDir.android in your package.json'
    );
  }
  codegenAndroidPath = path.resolve(projectPath, codegenAndroidPath);

  if (!(await fs.pathExists(codegenAndroidPath))) {
    throw new Error(
      `Could not find ${codegenAndroidPath}. Make sure you are in the correct directory and react-native codegen works properly.`
    );
  }

  const codegenJavaPackageName: string | undefined =
    packageJson.codegenConfig.android.javaPackageName;
  if (!codegenJavaPackageName) {
    throw new Error(
      'You need to define codegenConfig.android.javaPackageName in your package.json'
    );
  }

  const codegenJavaPath = path.resolve(
    codegenAndroidPath,
    `java/com/facebook/fbreact/specs`
  );

  // If this issue is ever fixed in react-native, this check will prevent the patching from running.
  if (!(await fs.pathExists(codegenJavaPath))) {
    console.log(
      `Could not find ${codegenJavaPath}. Skipping patching codegen java files.`
    );
    return;
  }

  const javaFiles = await fs.readdir(codegenJavaPath);

  await Promise.all(
    javaFiles.map(async (file) => {
      const filePath = path.resolve(codegenJavaPath, file);
      const fileContent = await fs.readFile(filePath, 'utf8');

      const newFileContent = fileContent.replace(
        'package com.facebook.fbreact.specs',
        `package ${codegenJavaPackageName}`
      );

      await fs.writeFile(filePath, newFileContent);
    })
  );

  const newPackagePath = path.resolve(
    codegenAndroidPath,
    `java/${codegenJavaPackageName.replace(/\./g, '/')}`
  );

  if (!(await fs.pathExists(newPackagePath))) {
    await fs.mkdir(newPackagePath, { recursive: true });
  }

  await Promise.all(
    javaFiles.map(async (file) => {
      const filePath = path.resolve(codegenJavaPath, file);
      const newFilePath = path.resolve(newPackagePath, file);

      await fs.rename(filePath, newFilePath);
    })
  );

  await fs.rm(path.resolve(codegenAndroidPath, 'java/com/facebook'), {
    recursive: true,
  });
}

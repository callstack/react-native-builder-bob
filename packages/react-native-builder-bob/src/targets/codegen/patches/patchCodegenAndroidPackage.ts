import fs from 'fs-extra';
import path from 'path';
import type { Report } from '../../../types';
import kleur from 'kleur';

export const CODEGEN_DOCS =
  'https://reactnative.dev/docs/the-new-architecture/using-codegen#configuring-codegen';

/**
 * Currently, running react-native codegen generates java files with package name `com.facebook.fbreact.specs`.
 * This is a known issue in react-native itself.
 * You can find the relevant line here: https://github.com/facebook/react-native/blob/dc460147bb00d6f912cc0a829f8040d85faeeb13/packages/react-native/scripts/codegen/generate-artifacts-executor.js#L459.
 * To workaround, this function renames the package name to the one provided in the codegenConfig.
 * @throws if codegenConfig.outputDir.android or codegenConfig.android.javaPackageName is not defined in package.json
 * @throws if the codegenAndroidPath does not exist
 */
export async function patchCodegenAndroidPackage(
  projectPath: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  packageJson: any,
  report: Report
) {
  let codegenAndroidPath: string | undefined =
    packageJson.codegenConfig?.outputDir?.android;
  if (!codegenAndroidPath) {
    throw new Error(
      `Your package.json doesn't contain codegenConfig.outputDir.android. Please see ${CODEGEN_DOCS}`
    );
  }
  codegenAndroidPath = path.resolve(projectPath, codegenAndroidPath);

  if (!(await fs.pathExists(codegenAndroidPath))) {
    throw new Error(
      `The codegen android path defined in your package.json: ${codegenAndroidPath} doesn't exist.`
    );
  }

  const codegenJavaPackageName: string | undefined =
    packageJson.codegenConfig.android.javaPackageName;
  if (!codegenJavaPackageName) {
    throw new Error(
      `Your package.json doesn't contain codegenConfig.android.javaPackageName. Please see ${CODEGEN_DOCS}`
    );
  }

  const codegenJavaPath = path.resolve(
    codegenAndroidPath,
    `java/com/facebook/fbreact/specs`
  );

  // If this issue is ever fixed in react-native, this check will prevent the patching from running.
  if (!(await fs.pathExists(codegenJavaPath))) {
    report.info(
      `Could not find ${kleur.blue(
        path.relative(projectPath, codegenJavaPath)
      )}. Skipping patching codegen java files.`
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

  if (
    await fs.pathExists(
      path.resolve(codegenAndroidPath, 'java/com/facebook/react/viewmanagers')
    )
  ) {
    // Keep the view managers
    await fs.rm(path.resolve(codegenAndroidPath, 'java/com/facebook/fbreact'), {
      recursive: true,
    });
  } else {
    // Delete the entire facebook namespace
    await fs.rm(path.resolve(codegenAndroidPath, 'java/com/facebook'), {
      recursive: true,
    });
  }
}

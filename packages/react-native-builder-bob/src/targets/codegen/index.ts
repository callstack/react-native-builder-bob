import kleur from 'kleur';
import type { Input } from '../../types';
import { patchCodegenAndroidPackage } from './patches/patchCodegenAndroidPackage';
import fs from 'fs-extra';
import path from 'path';
import del from 'del';
import { runRNCCli } from '../../utils/runRNCCli';
import { removeCodegenAppLevelCode } from './patches/removeCodegenAppLevelCode';

type Options = Input;

export default async function build({ root, report }: Options) {
  const packageJsonPath = path.resolve(root, 'package.json');
  const packageJson = await fs.readJson(packageJsonPath);

  const codegenIosPath = packageJson.codegenConfig?.outputDir?.ios;
  if (codegenIosPath != null) {
    report.info(
      `Cleaning up previous iOS codegen native code at ${kleur.blue(
        path.relative(root, codegenIosPath)
      )}`
    );
    await del([codegenIosPath]);
  }

  const codegenAndroidPath = packageJson.codegenConfig?.outputDir?.android;
  if (codegenAndroidPath != null) {
    report.info(
      `Cleaning up previous Android codegen native code at ${kleur.blue(
        path.relative(root, codegenAndroidPath)
      )}`
    );
    await del([codegenAndroidPath]);
  }

  const codegenType = packageJson.codegenConfig?.type;

  if (codegenType === undefined) {
    throw new Error(
      "Couldn't find the 'type' value in 'codegenConfig'. Please check your package.json's 'codegenConfig' property and make sure 'type' is defined. https://reactnative.dev/docs/the-new-architecture/using-codegen#configuring-codegen"
    );
  }

  try {
    await runRNCCli(['codegen']);

    if (codegenType === 'modules' || codegenType === 'all') {
      await patchCodegenAndroidPackage(root, packageJson, report);
    }
    await removeCodegenAppLevelCode(root, packageJson);

    report.success('Generated native code with codegen');
  } catch (e: unknown) {
    if (e != null && typeof e === 'object') {
      if ('stdout' in e && e.stdout != null) {
        throw new Error(
          `Errors found while generating codegen files:\n${e.stdout.toString()}`
        );
      } else if ('message' in e && typeof e.message === 'string') {
        if (
          e.message.includes(
            "Error: Cannot find module '@react-native-community/cli/package.json'"
          )
        ) {
          throw new Error(
            "You don't have `@react-native-community/cli` in your root package's dev dependencies. Please install it and make sure it uses the same version as your application."
          );
        }
      }
    }

    throw e;
  }
}

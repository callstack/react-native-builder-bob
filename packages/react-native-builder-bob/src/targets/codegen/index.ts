import fs from 'fs-extra';
import kleur from 'kleur';
import path from 'path';
import type { Input } from '../../types';
import { rmrf } from '../../utils/rmrf';
import { runRNCCli } from '../../utils/runRNCCli';
import { patchCodegenAndroidPackage } from './patches/patchCodegenAndroidPackage';
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

    await rmrf(codegenIosPath, { root });
  }

  const codegenAndroidPath = packageJson.codegenConfig?.outputDir?.android;
  if (codegenAndroidPath != null) {
    report.info(
      `Cleaning up previous Android codegen native code at ${kleur.blue(
        path.relative(root, codegenAndroidPath)
      )}`
    );

    rmrf(codegenAndroidPath, { root });
  }

  const codegenType = packageJson.codegenConfig?.type;

  if (codegenType === undefined) {
    report.error(
      "Couldn't find the 'type' value in 'codegenConfig'. Please check your package.json's 'codegenConfig' property and make sure 'type' is defined. https://reactnative.dev/docs/the-new-architecture/using-codegen#configuring-codegen"
    );
    process.exit(1);
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
        report.error(
          `Errors found while generating codegen files:\n${e.stdout.toString()}`
        );
      } else if ('message' in e && typeof e.message === 'string') {
        if (
          e.message.includes(
            "Error: Cannot find module '@react-native-community/cli/package.json'"
          )
        ) {
          report.error(
            "You don't have `@react-native-community/cli` in your root package's dev dependencies. Please install it and make sure it uses the same version as your application."
          );
        } else {
          report.error(e.message);
        }
      } else {
        throw e;
      }
    } else {
      throw e;
    }

    process.exit(1);
  }
}

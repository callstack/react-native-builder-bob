import kleur from 'kleur';
import type { Input } from '../types';
import { patchCodegen } from '../utils/patchCodegen';
import fs from 'fs-extra';
import path from 'path';
import del from 'del';
import { runRNCCli } from '../utils/runRNCCli';

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

  try {
    await runRNCCli(['codegen']);

    await patchCodegen(root, packageJson, report);

    report.success('Generated native code with codegen');
  } catch (e: unknown) {
    if (e != null && typeof e === 'object') {
      if ('stdout' in e && e.stdout != null) {
        report.error(
          `Errors found while generating codegen files:\n${e.stdout.toString()}`
        );
      } else if ('message' in e && typeof e.message === 'string') {
        report.error(e.message);
      } else {
        throw e;
      }
    } else {
      throw e;
    }

    throw new Error('Failed generate the codegen files.');
  }
}

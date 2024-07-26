import path from 'path';
import fs from 'fs-extra';
import spawn from 'cross-spawn';
import type { Input } from '../types';
import { patchCodegen } from '../utils/patchCodegen';

type Options = Input;

export default async function build({ root, report }: Options) {
  try {
    const packageJsonPath = path.resolve(root, 'package.json');
    if (!(await fs.pathExists(packageJsonPath))) {
      throw new Error(
        `Couldn't find a 'package.json' file in '${root}'. Are you in a project folder?`
      );
    }

    spawn.sync('npx', ['react-native', 'codegen'], {
      stdio: 'inherit',
    });

    patchCodegen(root);

    report.success('Codegen patched successfully!');
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

    throw new Error('Failed generate codegen files.');
  }
}

import type { Input } from '../types';
import { patchCodegen } from '../utils/patchCodegen';
import { spawn } from '../utils/spawn';

type Options = Input;

export default async function build({ root, report }: Options) {
  try {
    await spawn('npx', ['react-native', 'codegen'], {
      stdio: 'ignore',
    });

    patchCodegen(root);

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

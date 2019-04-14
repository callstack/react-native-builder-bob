import chalk from 'chalk';
import path from 'path';
import child_process from 'child_process';
import fs from 'fs-extra';
import del from 'del';
import { Input } from '../types';

export default async function build({ root, output, report }: Input) {
  report.info('Cleaning up previous build');

  await del([output]);

  report.info(`Generating type definitions with ${chalk.blue('tsc')}`);

  const tsc = path.join(root, 'node_modules', '.bin', 'tsc');

  try {
    if (await fs.pathExists(tsc)) {
      child_process.execFileSync(tsc, [
        '--declaration',
        '--emitDeclarationOnly',
        '--outDir',
        output,
      ]);

      report.success(
        `Wrote definition files to ${chalk.blue(path.relative(root, output))}`
      );
    } else {
      throw new Error(
        `The ${chalk.blue(
          'tsc'
        )} binary doesn't seem to be installed under ${chalk.blue(
          'node_modules'
        )}. Make sure you have added ${chalk.blue(
          'typescript'
        )} to your ${chalk.blue('devDependencies')}.`
      );
    }
  } catch (e) {
    if (e.stdout) {
      report.error(
        `Errors found when building definition files.\n${e.stdout.toString()}`
      );
    } else {
      report.error(e.message);
    }

    throw new Error('Failed to build definition files.');
  }
}

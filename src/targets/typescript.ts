import chalk from 'chalk';
import path from 'path';
import child_process from 'child_process';
import del from 'del';
import { Input } from '../types';

export default async function build({ root, output, report }: Input) {
  report.info('Cleaning up previous build');

  await del([output]);

  report.info(`Generating type definitions with ${chalk.blue('tsc')}`);

  child_process.execFileSync(path.join(root, 'node_modules', '.bin', 'tsc'), [
    '--declaration',
    '--emitDeclarationOnly',
    '--outDir',
    output,
  ]);

  report.success(
    `Wrote definition files to ${chalk.blue(path.relative(root, output))}`
  );
}

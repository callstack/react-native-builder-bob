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
  const tsconfig = path.join(root, 'tsconfig.json');

  try {
    if (await fs.pathExists(tsconfig)) {
      const config = JSON.parse(await fs.readFile(tsconfig, 'utf-8'));

      if (config.compilerOptions) {
        if (config.compilerOptions.outDir) {
          report.warn(
            `Found ${chalk.blue('compilerOptions.outDir')} in ${chalk.blue(
              'tsconfig.json'
            )} which can conflict with the CLI options. It's recommended to remove it from the config file.`
          );
        }

        if (config.compilerOptions && config.compilerOptions.declarationDir) {
          report.warn(
            `Found ${chalk.blue(
              'compilerOptions.declarationDir'
            )} in ${chalk.blue(
              'tsconfig.json'
            )} which can conflict with the CLI options. It's recommended to remove it from the config file.`
          );
        }
      }
    }

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

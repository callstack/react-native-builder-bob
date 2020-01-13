import chalk from 'chalk';
import path from 'path';
import child_process from 'child_process';
import fs from 'fs-extra';
import del from 'del';
import JSON5 from 'json5';
import { platform } from 'os';
import { Input } from '../types';

type Options = Input & {
  options?: { project?: string };
};

export default async function build({
  root,
  output,
  report,
  options,
}: Options) {
  report.info(
    `Cleaning up previous build at ${chalk.blue(path.relative(root, output))}`
  );

  await del([output]);

  report.info(`Generating type definitions with ${chalk.blue('tsc')}`);

  const project = options?.project ? options.project : 'tsconfig.json';
  const tsconfig = path.join(root, project);

  try {
    if (await fs.pathExists(tsconfig)) {
      try {
        const config = JSON5.parse(await fs.readFile(tsconfig, 'utf-8'));

        if (config.compilerOptions) {
          const conflicts: string[] = [];

          if (config.compilerOptions.noEmit !== undefined) {
            conflicts.push('compilerOptions.noEmit');
          }

          if (config.compilerOptions.emitDeclarationOnly !== undefined) {
            conflicts.push('compilerOptions.emitDeclarationOnly');
          }

          if (config.compilerOptions.declarationDir) {
            conflicts.push('compilerOptions.declarationDir');
          }

          if (
            config.compilerOptions.outDir &&
            path.join(root, config.compilerOptions.outDir) !== output
          ) {
            conflicts.push('compilerOptions.outDir');
          }

          if (conflicts.length) {
            report.warn(
              `Found following options in the config file which can conflict with the CLI options. Please remove them from ${chalk.blue(
                project
              )}:${conflicts.reduce(
                (acc, curr) =>
                  acc + `\n${chalk.gray('-')} ${chalk.yellow(curr)}`,
                ''
              )}`
            );
          }
        }
      } catch (e) {
        report.warn(
          `Couldn't parse '${project}'. There might be validation errors.`
        );
      }
    }

    let tsc =
      path.join(root, 'node_modules', '.bin', 'tsc') +
      (platform() === 'win32' ? '.cmd' : '');

    if (!(await fs.pathExists(tsc))) {
      tsc = child_process
        .execSync('which tsc')
        .toString('utf-8')
        .trim();
    }

    if (await fs.pathExists(tsc)) {
      child_process.execFileSync(tsc, [
        '--pretty',
        '--declaration',
        '--emitDeclarationOnly',
        '--project',
        project,
        '--outDir',
        output,
      ]);

      await del([
        path.join(output, project.replace(/\.json$/, '.tsbuildinfo')),
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
        )} or present in $PATH. Make sure you have added ${chalk.blue(
          'typescript'
        )} to your ${chalk.blue('devDependencies')}.`
      );
    }
  } catch (e) {
    if (e.stdout) {
      report.error(
        `Errors found when building definition files:\n${e.stdout.toString()}`
      );
    } else {
      report.error(e.message);
    }

    throw new Error('Failed to build definition files.');
  }
}

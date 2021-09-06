import chalk from 'chalk';
import path from 'path';
import fs from 'fs-extra';
import which from 'which';
import spawn from 'cross-spawn';
import del from 'del';
import JSON5 from 'json5';
import { platform } from 'os';
import type { Input, TSTargetOptions } from '../types';

type Options = Input & {
  options?: TSTargetOptions;
};

export default async function build({
  root,
  output,
  report,
  options,
  watch,
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
    } else {
      throw new Error(
        `Couldn't find a ${chalk.blue('tsconfig.json')} in the project root.`
      );
    }

    let tsc = options?.tsc
      ? path.resolve(root, options.tsc)
      : path.resolve(root, 'node_modules', '.bin', 'tsc') +
        (platform() === 'win32' ? '.cmd' : '');

    if (!(await fs.pathExists(tsc))) {
      try {
        tsc = await which('tsc');

        report.warn(
          `Using a global version of ${chalk.blue(
            'tsc'
          )}. Consider adding ${chalk.blue('typescript')} to your ${chalk.blue(
            'devDependencies'
          )} or specifying the ${chalk.blue(
            'tsc'
          )} option for the typescript target.`
        );
      } catch (e) {
        // Ignore
      }
    }

    if (!(await fs.pathExists(tsc))) {
      throw new Error(
        `The ${chalk.blue(
          'tsc'
        )} binary doesn't seem to be installed under ${chalk.blue(
          'node_modules'
        )} or present in $PATH. Make sure you have added ${chalk.blue(
          'typescript'
        )} to your ${chalk.blue('devDependencies')} or specify the ${chalk.blue(
          'tsc'
        )} option for typescript.`
      );
    }

    const tsbuildinfo = path.join(
      output,
      project.replace(/\.json$/, '.tsbuildinfo')
    );

    try {
      await del([tsbuildinfo]);
    } catch (e) {
      // Ignore
    }

    const args = [
      '--pretty',
      '--declaration',
      '--emitDeclarationOnly',
      '--project',
      project,
      '--outDir',
      output,
    ];

    if (watch) {
      args.push('--watch', '--preserveWatchOutput');
    }

    const result = spawn.sync(tsc, args, { stdio: 'inherit' });

    if (result.status === 0) {
      await del([tsbuildinfo]);

      report.success(
        `Wrote definition files to ${chalk.blue(path.relative(root, output))}`
      );
    } else {
      throw new Error('Failed to build definition files.');
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

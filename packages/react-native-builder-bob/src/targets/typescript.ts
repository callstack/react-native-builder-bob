import kleur from 'kleur';
import path from 'path';
import fs from 'fs-extra';
import which from 'which';
import spawn from 'cross-spawn';
import del from 'del';
import JSON5 from 'json5';
import { platform } from 'os';
import type { Input } from '../types';

type Options = Input & {
  options?: { project?: string; tsc?: string };
};

export default async function build({
  root,
  output,
  report,
  options,
}: Options) {
  report.info(
    `Cleaning up previous build at ${kleur.blue(path.relative(root, output))}`
  );

  await del([output]);

  report.info(`Generating type definitions with ${kleur.blue('tsc')}`);

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
              `Found following options in the config file which can conflict with the CLI options. Please remove them from ${kleur.blue(
                project
              )}:${conflicts.reduce(
                (acc, curr) =>
                  acc + `\n${kleur.gray('-')} ${kleur.yellow(curr)}`,
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
        `Couldn't find a ${kleur.blue('tsconfig.json')} in the project root.`
      );
    }

    let tsc;

    if (options?.tsc) {
      tsc = path.resolve(root, options.tsc);

      if (!(await fs.pathExists(tsc))) {
        throw new Error(
          `The ${kleur.blue(
            'tsc'
          )} binary doesn't seem to be installed at ${kleur.blue(
            tsc
          )}. Please specify the correct path in options or remove it to use the workspace's version.`
        );
      }
    } else {
      tsc = path.resolve(root, 'node_modules', '.bin', 'tsc');

      if (platform() === 'win32' && !tsc.endsWith('.cmd')) {
        tsc += '.cmd';
      }
    }

    if (!(await fs.pathExists(tsc))) {
      try {
        tsc = await which('tsc');

        if (await fs.pathExists(tsc)) {
          report.warn(
            `Failed to locate 'tsc' in the workspace. Falling back to the globally installed version. Consider adding ${kleur.blue(
              'typescript'
            )} to your ${kleur.blue(
              'devDependencies'
            )} or specifying the ${kleur.blue(
              'tsc'
            )} option for the typescript target.`
          );
        }
      } catch (e) {
        // Ignore
      }
    }

    if (tsc == null || !(await fs.pathExists(tsc))) {
      throw new Error(
        `The ${kleur.blue(
          'tsc'
        )} binary doesn't seem to be installed under ${kleur.blue(
          'node_modules'
        )} or present in $PATH. Make sure you have added ${kleur.blue(
          'typescript'
        )} to your ${kleur.blue('devDependencies')} or specify the ${kleur.blue(
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

    const result = spawn.sync(
      tsc,
      [
        '--pretty',
        '--declaration',
        '--declarationMap',
        '--emitDeclarationOnly',
        '--project',
        project,
        '--outDir',
        output,
      ],
      {
        stdio: 'inherit',
        cwd: root,
      }
    );

    if (result.status === 0) {
      await del([tsbuildinfo]);

      report.success(
        `Wrote definition files to ${kleur.blue(path.relative(root, output))}`
      );

      const pkg = JSON.parse(
        await fs.readFile(path.join(root, 'package.json'), 'utf-8')
      );

      if ('types' in pkg) {
        if (!pkg.types.endsWith('.d.ts')) {
          report.error(
            `The ${kleur.blue('types')} field in ${kleur.blue(
              'package.json'
            )} doesn't point to a definition file. Verify the path points to the correct file under ${kleur.blue(
              path.relative(root, output)
            )}.`
          );

          throw new Error("Found incorrect path in 'types' field.");
        }

        const typesPath = path.join(root, pkg.types);

        if (!(await fs.pathExists(typesPath))) {
          report.error(
            `The ${kleur.blue('types')} field in ${kleur.blue(
              'package.json'
            )} points to a non-existent file: ${kleur.blue(
              pkg.types
            )}.\nVerify the path points to the correct file under ${kleur.blue(
              path.relative(root, output)
            )}.`
          );

          throw new Error("Found incorrect path in 'types' field.");
        }
      } else {
        report.warn(
          `No ${kleur.blue('types')} field found in ${kleur.blue(
            'package.json'
          )}.\nConsider adding it so consumers can use the types.`
        );
      }
    } else {
      throw new Error('Failed to build definition files.');
    }
  } catch (e: unknown) {
    if (e != null && typeof e === 'object') {
      if ('stdout' in e && e.stdout != null) {
        report.error(
          `Errors found when building definition files:\n${e.stdout.toString()}`
        );
      } else if ('message' in e && typeof e.message === 'string') {
        report.error(e.message);
      } else {
        throw e;
      }
    } else {
      throw e;
    }

    throw new Error('Failed to build definition files.');
  }
}

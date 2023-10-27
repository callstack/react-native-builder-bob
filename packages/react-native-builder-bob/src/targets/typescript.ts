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
  source,
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
      const execpath = process.env.npm_execpath;
      const cli = execpath?.split('/').pop()?.includes('yarn') ? 'yarn' : 'npm';

      if (cli === 'yarn') {
        const result = spawn.sync('yarn', ['bin', 'tsc'], {
          stdio: 'pipe',
          encoding: 'utf-8',
          cwd: root,
        });

        tsc = result.stdout.trim();
      } else {
        tsc = path.resolve(root, 'node_modules', '.bin', 'tsc');
      }

      if (platform() === 'win32' && !tsc.endsWith('.cmd')) {
        tsc += '.cmd';
      }
    }

    if (!(await fs.pathExists(tsc))) {
      try {
        tsc = await which('tsc');

        if (await fs.pathExists(tsc)) {
          report.warn(
            `Failed to locate ${kleur.blue(
              'tsc'
            )} in the workspace. Falling back to the binary found in ${kleur.blue(
              'PATH'
            )} at ${kleur.blue(tsc)}. Consider adding ${kleur.blue(
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

      const getGeneratedTypesPath = async () => {
        if (pkg.source) {
          const indexDTsName =
            path.basename(pkg.source).replace(/\.(jsx?|tsx?)$/, '') + '.d.ts';

          const potentialPaths = [
            path.join(output, path.dirname(pkg.source), indexDTsName),
            path.join(
              output,
              path.dirname(path.relative(source, path.join(root, pkg.source))),
              indexDTsName
            ),
          ];

          for (const potentialPath of potentialPaths) {
            if (await fs.pathExists(potentialPath)) {
              return path.relative(root, potentialPath);
            }
          }
        }

        return null;
      };

      if ('types' in pkg) {
        const typesPath = path.join(root, pkg.types);

        if (!(await fs.pathExists(typesPath))) {
          const generatedTypesPath = await getGeneratedTypesPath();

          if (!generatedTypesPath) {
            report.warn(
              `Failed to detect the entry point for the generated types. Make sure you have a valid ${kleur.blue(
                'source'
              )} field in your ${kleur.blue('package.json')}.`
            );
          }

          report.error(
            `The ${kleur.blue('types')} field in ${kleur.blue(
              'package.json'
            )} points to a non-existent file: ${kleur.blue(
              pkg.types
            )}.\nVerify the path points to the correct file under ${kleur.blue(
              path.relative(root, output)
            )}${
              generatedTypesPath
                ? ` (found ${kleur.blue(generatedTypesPath)}).`
                : '.'
            }`
          );

          throw new Error("Found incorrect path in 'types' field.");
        }
      } else {
        const generatedTypesPath = await getGeneratedTypesPath();

        report.warn(
          `No ${kleur.blue('types')} field found in ${kleur.blue(
            'package.json'
          )}.\nConsider ${
            generatedTypesPath
              ? `pointing it to ${kleur.blue(generatedTypesPath)}`
              : 'adding it'
          } so that consumers of your package can use the types.`
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

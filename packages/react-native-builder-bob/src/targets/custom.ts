import kleur from 'kleur';
import path from 'node:path';
import fs from 'fs-extra';
import type { Input } from '../types.ts';
import { spawn } from '../utils/spawn.ts';
import del from 'del';

type Options = Omit<Input, 'output'> & {
  options?: {
    script?: string;
    clean?: string;
  };
};

export default async function customTarget({ options, root, report }: Options) {
  if (options?.script == null) {
    throw new Error(
      `No 'script' was provided with the custom target. Example: ${kleur.green(
        '{["custom", { "script": "generateTypes" }}'
      )}`
    );
  }

  const pathToClean = options.clean
    ? path.relative(root, options.clean)
    : undefined;

  if (pathToClean) {
    report.info(`Cleaning up ${kleur.blue(pathToClean)}`);

    await del([path.resolve(root, pathToClean)]);
  }

  const packageManagerExecutable = process.env.npm_execpath ?? 'npm';
  const packageManagerArgs = ['run', options.script];

  // usr/bin/yarn -> yarn
  const packageManagerName = path.basename(packageManagerExecutable);
  report.info(
    `Running ${kleur.blue(packageManagerName)} ${kleur.blue(
      packageManagerArgs.join(' ')
    )}`
  );

  await spawn(packageManagerExecutable, packageManagerArgs, {
    stdio: ['ignore', 'ignore', 'inherit'],
  });

  report.success(`Ran the ${kleur.blue(options.script)} script succesfully`);

  if (options.clean && pathToClean && !(await fs.pathExists(pathToClean))) {
    report.warn(
      `Custom target with the ${kleur.blue(
        options.script
      )} script has ${kleur.blue(options.clean)} as the ${kleur.bold(
        'clean'
      )} option but this path wasn't created after running the script. Are you sure you've defined the ${kleur.bold(
        'clean'
      )} path correctly?`
    );
  }
}

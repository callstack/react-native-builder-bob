import dedent from 'dedent';
import fs from 'fs-extra';
import kleur from 'kleur';
import path from 'path';
import type { Input } from '../types';
import { rmrf } from '../utils/rmrf';
import { spawn } from '../utils/spawn';

type Options = Omit<Input, 'output'> & {
  options?: {
    script?: string;
    clean?: string;
  };
};

export default async function customTarget({ options, root, report }: Options) {
  if (options?.script == null) {
    report.error(
      dedent(
        `No script was provided with the custom target.
         Example: ${kleur.green('{["custom", { "script": "generateTypes" }}')}`
      )
    );
    process.exit(1);
  }

  const pathToClean = options.clean
    ? path.relative(root, options.clean)
    : undefined;

  if (pathToClean) {
    report.info(`Cleaning up ${kleur.blue(pathToClean)}`);

    await rmrf(pathToClean, { root });
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

  try {
    await spawn(packageManagerExecutable, packageManagerArgs, {
      stdio: ['ignore', 'ignore', 'inherit'],
    });
  } catch (e) {
    report.error(
      `An error occurred when running ${kleur.blue(options.script)}`
    );
    process.exit(1);
  }

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

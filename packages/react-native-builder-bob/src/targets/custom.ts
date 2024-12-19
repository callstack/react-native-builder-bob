import kleur from 'kleur';
import path from 'path';
import type { Input } from '../types';
import { spawn } from '../utils/spawn';
import dedent from 'dedent';
import del from 'del';

type Options = Input & {
  options?: {
    script?: string;
    clean?: string;
  };
};

export default async function customTarget({ options, root, report }: Options) {
  if (options?.script === undefined) {
    report.error(
      dedent(
        `No script was provided with the custom target.
         Example: ${kleur.green('{["custom", { "script": "generateTypes" }}')}`
      )
    );
    process.exit(1);
  }

  if (options.clean) {
    report.info(
      `Cleaning up previous custom build at ${kleur.blue(
        path.relative(root, options.clean)
      )}`
    );

    await del([path.resolve(root, options.clean)]);
  }

  const packageManager = process.env.npm_execpath ?? 'npm';
  const packageManagerArgs = ['run', options.script];

  // usr/bin/yarn -> yarn
  const packageManagerName = path.basename(packageManager);
  report.info(
    `Calling ${kleur.blue(packageManagerName)} ${kleur.blue(
      packageManagerArgs.join(' ')
    )}`
  );

  try {
    await spawn(packageManager, packageManagerArgs, {
      stdio: ['ignore', 'ignore', 'inherit'],
    });
  } catch (e) {
    report.error(`Couldn't run the ${kleur.blue(options.script)} script`);
    process.exit(1);
  }

  report.success(`Ran the ${kleur.blue(options.script)} script succesfully`);
}

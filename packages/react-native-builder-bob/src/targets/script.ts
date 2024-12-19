import kleur from 'kleur';
import path from 'path';
import type { Input } from '../types';
import { spawn } from '../utils/spawn';
import dedent from 'dedent';
import del from 'del';

type Options = Input & {
  options?: {
    run?: string;
    cwd?: string;
    clean?: string;
  }
};

export default async function runScript({
  options,
  root,
  report
}: Options) {
  if (options?.run === undefined) {
    report.error(
      dedent(
        `No runnable provided with the script target.
         Example: ${kleur.green('{["script", { run: "yarn generateTypes" }}')}`
      )
    )
    process.exit(1)
  }

  const [scriptBinary, ...scriptParams] = options.run.split(" ");
  if (scriptBinary === undefined) {
    report.error(
      "No runnable provided with the script target."
    )
    process.exit(1)
  }

  const cwd = options?.cwd ?? root

  if (options.clean) {
    report.info(
      `Cleaning up previous script target at ${kleur.blue(path.relative(root, options.clean))}`
    );

    await del([path.resolve(cwd, options.clean)])
  }


  report.info(
    `Running ${kleur.blue(options.run)} `
  );

  await spawn(scriptBinary, scriptParams, {
    cwd,
  })

  report.success(`Ran ${kleur.blue(options.run)} succesfully`)
}

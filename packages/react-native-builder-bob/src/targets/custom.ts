import kleur from 'kleur';
import path from 'path';
import type { Input } from '../types';
import { spawn } from '../utils/spawn';
import dedent from 'dedent';
import del from 'del';

type Options = Input & {
  options?: {
    script?: string;
    cwd?: string;
    clean?: string;
  }
};

const NO_SCRIPT_ERROR_MESSAGE = dedent(
  `No script provided with the custom target.
         Example: ${kleur.green('{["custom", { "script": "yarn generateTypes" }}')}`
)

export default async function customTarget({
  options,
  root,
  report
}: Options) {
  if (options?.script === undefined) {
    report.error(
      NO_SCRIPT_ERROR_MESSAGE
    )
    process.exit(1)
  }

  const [scriptBinary, ...scriptParams] = options.script.split(" ");
  if (scriptBinary === undefined) {
    report.error(
      NO_SCRIPT_ERROR_MESSAGE
    )
    process.exit(1)
  }

  let cwd = root
  if (options.cwd) {
    cwd = path.resolve(root, options.cwd)
  }

  if (options.clean) {
    report.info(
      `Cleaning up previous custom build at ${kleur.blue(path.relative(root, options.clean))}`
    );

    await del([path.resolve(cwd, options.clean)])
  }


  report.info(
    `Running ${kleur.blue(options.script)} `
  );

  await spawn(scriptBinary, scriptParams, {
    cwd,
  })

  report.success(`Ran ${kleur.blue(options.script)} succesfully`)
}

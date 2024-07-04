import path from 'path';
import kleur from 'kleur';
import del from 'del';
import compile from '../utils/compile';
import type { Input } from '../types';

type Options = Input & {
  options?: {
    esm?: boolean;
    babelrc?: boolean | null;
    configFile?: string | false | null;
    sourceMaps?: boolean;
    copyFlow?: boolean;
  };
  exclude: string;
};

export default async function build({
  root,
  source,
  output,
  exclude,
  options,
  report,
}: Options) {
  report.info(
    `Cleaning up previous build at ${kleur.blue(path.relative(root, output))}`
  );

  await del([output]);

  await compile({
    ...options,
    root,
    source,
    output,
    exclude,
    modules: 'commonjs',
    report,
  });
}

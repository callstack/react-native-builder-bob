import path from 'path';
import kleur from 'kleur';
import del from 'del';
import compile, { type CompileOptions } from '../utils/compile';
import type { Input, Variants } from '../types';

type Options = Input & {
  options?: CompileOptions;
  variants: Variants;
  exclude: string;
};

export default async function build({
  root,
  source,
  output,
  exclude,
  options,
  variants,
  report,
}: Options) {
  report.info(
    `Cleaning up previous build at ${kleur.blue(path.relative(root, output))}`
  );

  await del([output]);

  await compile({
    ...options,
    variants,
    root,
    source,
    output,
    exclude,
    modules: 'commonjs',
    report,
  });
}

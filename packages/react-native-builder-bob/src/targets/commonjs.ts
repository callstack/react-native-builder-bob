import path from 'node:path';
import { deleteAsync } from 'del';
import kleur from 'kleur';
import type { Input, Variants } from '../types.ts';
import compile, { type CompileOptions } from '../utils/compile.ts';

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

  await deleteAsync([output]);

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

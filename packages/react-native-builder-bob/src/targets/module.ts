import kleur from 'kleur';
import path from 'path';
import type { Input, Variants } from '../types';
import compile, { type CompileOptions } from '../utils/compile';
import { rmrf } from '../utils/rmrf';

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

  await rmrf(output, { root });

  await compile({
    ...options,
    variants,
    root,
    source,
    output,
    exclude,
    modules: 'preserve',
    report,
  });
}

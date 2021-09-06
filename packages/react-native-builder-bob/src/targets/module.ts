import path from 'path';
import chalk from 'chalk';
import del from 'del';
import compile from '../utils/compile';
import type { Input, ModuleTargetOptions } from '../types';

type Options = Input & {
  options?: ModuleTargetOptions;
};

export default async function build({
  root,
  source,
  output,
  options,
  report,
  watch,
}: Options) {
  report.info(
    `Cleaning up previous build at ${chalk.blue(path.relative(root, output))}`
  );

  await del([output]);

  await compile({
    root,
    source,
    output,
    modules: false,
    babelrc: options?.babelrc,
    configFile: options?.configFile,
    copyFlow: options?.copyFlow,
    watch,
    report,
  });
}

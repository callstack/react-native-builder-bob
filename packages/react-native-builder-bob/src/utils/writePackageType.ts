import path from 'node:path';
import fs from 'fs-extra';
import kleur from 'kleur';
import type { Report } from '../types.ts';

type Options = {
  root: string;
  output: string;
  type: 'commonjs' | 'module';
  pkg: { type?: unknown; imports?: unknown };
  report: Report;
};

/**
 * Write a `package.json` with the `type` field to the output folder.
 *
 * The generated `package.json` also starts a new package scope for the files in it.
 * Tools resolve fields such as `imports` from the closest `package.json`,
 * so the fields in the root `package.json` don't apply to the built files anymore.
 * We skip it when the root `package.json` already has the same `type` and the output is inside the root,
 * since it's not needed.
 */
export async function writePackageType({
  root,
  output,
  type,
  pkg,
  report,
}: Options) {
  const relativeOutput = path.relative(root, output);
  const isInsideRoot =
    !relativeOutput.startsWith('..') && !path.isAbsolute(relativeOutput);

  if (pkg.type === type && isInsideRoot) {
    return;
  }

  const hasImports =
    typeof pkg.imports === 'object' &&
    pkg.imports != null &&
    Object.keys(pkg.imports).length > 0;

  if (hasImports && pkg.type !== type) {
    report.warn(
      `The ${kleur.blue('imports')} field in ${kleur.blue(
        'package.json'
      )} won't apply to the files in ${kleur.blue(
        relativeOutput
      )}, since a ${kleur.blue('package.json')} with ${kleur.blue(
        `"type": "${type}"`
      )} is generated there. This file is skipped if the ${kleur.blue(
        'type'
      )} field in your ${kleur.blue('package.json')} is set to ${kleur.blue(
        `"${type}"`
      )}.`
    );
  }

  await fs.writeJSON(path.join(output, 'package.json'), { type });
}

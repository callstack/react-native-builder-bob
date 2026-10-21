import path from 'node:path';
import fs from 'fs-extra';
import kleur from 'kleur';
import type { Report, Variants } from '../types.ts';

type Options = {
  root: string;
  output: string;
  type: 'commonjs' | 'module';
  pkg: { type?: unknown; imports?: unknown };
  variants: Variants;
  report: Report;
};

/**
 * The generated `package.json` also starts a new package scope for the files in it.
 * Tools resolve fields such as `imports` from the closest `package.json`,
 * so the fields in the root `package.json` don't apply to the built files anymore.
 * We skip it when the root `package.json` already has the same `type` and the output is inside the root.
 */
export async function writePackageType({
  root,
  output,
  type,
  pkg,
  variants,
  report,
}: Options) {
  const relativeOutput = path.relative(root, output);
  const isInsideRoot =
    !relativeOutput.startsWith('..') && !path.isAbsolute(relativeOutput);

  if (pkg.type === type && isInsideRoot) {
    return;
  }

  const hasImports = Object.keys(pkg.imports ?? {}).length > 0;

  // In a dual package setup, one of the builds always needs a `package.json` with a different `type`
  // The docs recommend `"type": "module"`, so we only warn for the ESM build to avoid conflicting advice
  // Suggesting `"type": "commonjs"` instead doesn't work either, since without `esm` the module build gets no `package.json`
  // So the root `type` would apply to its ESM syntax and break NextJS
  if (hasImports && isInsideRoot && !(type === 'commonjs' && variants.module)) {
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

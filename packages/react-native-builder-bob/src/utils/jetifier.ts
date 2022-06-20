import path from 'path';
import kleur from 'kleur';
import { execFileSync } from 'child_process';
import fs from 'fs-extra';
import type { Report } from '../types';

type Options = {
  root: string;
  input: string;
  output: string;
  reverse: boolean;
  report: Report;
};

export default async function jetifier({
  root,
  input,
  output,
  reverse,
}: Options) {
  const jetifierStandalone = path.join(
    root,
    'node_modules',
    '.bin',
    'jetifier-standalone'
  );

  if (await fs.pathExists(jetifierStandalone)) {
    const args = ['-i', input, '-o', output];
    if (reverse) {
      args.push('-r');
    }

    execFileSync(jetifierStandalone, args);
  } else {
    throw new Error(
      `The ${kleur.blue(
        'jetifier'
      )} binary doesn't seem to be installed under ${kleur.blue(
        'node_modules'
      )}. Make sure you have added ${kleur.blue(
        'jetifier'
      )} to your ${kleur.blue('devDependencies')}.`
    );
  }
}

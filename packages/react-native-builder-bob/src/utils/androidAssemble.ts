import path from 'path';
import kleur from 'kleur';
import fs from 'fs-extra';
import { execFileSync } from 'child_process';
import { platform } from 'os';
import type { Report } from '../types';

type Options = {
  root: string;
  androidPath: string;
  report: Report;
};

export default async function androidAssemble({
  root,
  androidPath,
  report,
}: Options) {
  const cwd = path.relative(root, androidPath);

  report.info(
    `Assembling Android project in ${kleur.blue(cwd)} with ${kleur.blue(
      'gradle'
    )}`
  );

  const gradleWrapper = platform() === 'win32' ? 'gradlew.bat' : './gradlew';
  if (await fs.pathExists(path.join(androidPath, gradleWrapper))) {
    execFileSync(gradleWrapper, ['assemble'], { cwd: androidPath });
  } else {
    throw new Error(
      `The ${kleur.blue(
        'gradlew'
      )} script doesn't seem to present in ${kleur.blue(
        androidPath
      )}. Make sure you have added it by running ${kleur.blue(
        'gradle wrapper'
      )} in that directory.`
    );
  }
}

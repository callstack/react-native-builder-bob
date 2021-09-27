import path from 'path';
import chalk from 'chalk';
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
    `Assembling Android project in ${chalk.blue(cwd)} with ${chalk.blue(
      'gradle'
    )}`
  );

  const gradleWrapper = platform() === 'win32' ? 'gradlew.bat' : './gradlew';
  if (await fs.pathExists(path.join(androidPath, gradleWrapper))) {
    execFileSync(gradleWrapper, ['assemble'], { cwd: androidPath });
  } else {
    throw new Error(
      `The ${chalk.blue(
        'gradlew'
      )} script doesn't seem to present in ${chalk.blue(
        androidPath
      )}. Make sure you have added it by running ${chalk.blue(
        'gradle wrapper'
      )} in that directory.`
    );
  }
}

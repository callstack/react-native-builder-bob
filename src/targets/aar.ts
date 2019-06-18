import path from 'path';
import chalk from 'chalk';
import fs from 'fs-extra';
import del from 'del';
import androidAssemble from '../utils/androidAssemble';
import { Input } from '../types';
import jetifier from '../utils/jetifier';

type TargetOptions = {
  androidPath: string,
  reverseJetify: boolean
};

const defaultOptions: TargetOptions = {
  androidPath: "android",
  reverseJetify: false
};

type Options = Input & {
  options?: Partial<TargetOptions>;
};

async function createGradleFile(file: string) {
  await fs.createFile(file);
  await fs.writeFile(file, 'configurations.maybeCreate("default")\nartifacts.add("default", file(\'android.aar\'))')
}

export default async function build({
  root,
  output,
  options,
  report,
}: Options) {
  const targetOptions = {
    ...defaultOptions,
    ...options
  };

  report.info(
    `Cleaning up previous build at ${chalk.blue(path.relative(root, output))}`
  );

  await del([output]);

  await androidAssemble({ root, androidPath: targetOptions.androidPath, report });

  report.info(
    `Creating new output directory at ${chalk.blue(path.relative(root, output))}`
  );
  await fs.mkdir(output);

  const sourceAar = path.join(targetOptions.androidPath, 'build', 'outputs', 'aar', 'android.aar');
  const targetAar = path.join(output, 'android.aar');

  report.info(
    `Copying AAR from ${chalk.blue(path.relative(root, sourceAar))} to ${chalk.blue(path.relative(root, targetAar))}`
  );
  await fs.copyFile(sourceAar, targetAar);

  const gradleFile = path.join(output, 'build.gradle');
  report.info(
    `Creating AAR Gradle file at ${chalk.blue(path.relative(root, gradleFile))}`
  );
  await createGradleFile(gradleFile);

  if (targetOptions.reverseJetify) {
    const supportOutputPath = path.join(output, 'support');
    report.info(
      `Creating new support output directory at ${chalk.blue(path.relative(root, supportOutputPath))}`
    );
    await fs.mkdir(supportOutputPath);

    const supportAar = path.join(supportOutputPath, 'android.aar');
    report.info(
      `Using Jetifier to convert AAR from AndroidX to Support AAR at ${chalk.blue(path.relative(root, supportAar))}`
    );

    await jetifier({
      root,
      report,
      input: targetAar,
      output: supportAar,
      reverse: true
    });

    const supportGradleFile = path.join(supportOutputPath, 'build.gradle');
    report.info(
      `Creating Support AAR Gradle file at ${chalk.blue(path.relative(root, supportGradleFile))}`
    );
    await createGradleFile(supportGradleFile);
  }

  report.success(
    `Wrote files to ${chalk.blue(path.relative(root, output))}`
  );
}

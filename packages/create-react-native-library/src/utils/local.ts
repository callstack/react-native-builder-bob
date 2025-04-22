import fs from 'fs-extra';
import path from 'path';
import { prompt } from './prompt';
import type { TemplateConfiguration } from '../template';
import type { Args } from '../input';

type PackageJson = {
  dependencies?: Record<string, string>;
};

export async function promptLocalLibrary(argv: Args): Promise<boolean> {
  if (typeof argv.local === 'boolean') {
    return argv.local;
  }

  const hasPackageJson = findAppPackageJsonPath() !== null;
  if (!hasPackageJson) {
    return false;
  }

  // If we're under a project with package.json, ask the user if they want to create a local library
  const answers = await prompt({
    type: 'confirm',
    name: 'local',
    message: `Looks like you're under a project folder. Do you want to create a local library?`,
    initial: true,
  });

  return answers.local;
}

/** @returns `true` if successfull */
export async function addNitroDependencyToLocalLibrary(
  config: TemplateConfiguration
): Promise<boolean> {
  if (config.versions.nitroModules === undefined) {
    return false;
  }

  const appPackageJsonPath = await findAppPackageJsonPath();
  if (appPackageJsonPath === null) {
    return false;
  }

  const appPackageJson: PackageJson = await fs.readJson(appPackageJsonPath);
  const dependencies = appPackageJson['dependencies'] ?? {};

  dependencies['react-native-nitro-modules'] = config.versions.nitroModules;

  appPackageJson['dependencies'] = dependencies;
  await fs.writeJson(appPackageJsonPath, appPackageJson, {
    spaces: 2,
  });

  return true;
}

/** @returns `true` if successfull */
export async function linkLocalLibrary(
  config: TemplateConfiguration,
  folder: string,
  packageManager: string
): Promise<boolean> {
  const appPackageJsonPath = await findAppPackageJsonPath();
  if (appPackageJsonPath === null) {
    return false;
  }

  const appPackageJson: PackageJson = await fs.readJson(appPackageJsonPath);

  const isReactNativeProject = Boolean(
    appPackageJson.dependencies?.['react-native']
  );

  if (!isReactNativeProject) {
    return false;
  }

  const dependencies = appPackageJson['dependencies'] ?? {};
  dependencies[config.project.slug] =
    packageManager === 'yarn'
      ? `link:./${path.relative(process.cwd(), folder)}`
      : `file:./${path.relative(process.cwd(), folder)}`;

  await fs.writeJSON(appPackageJsonPath, appPackageJson, {
    spaces: 2,
  });

  return true;
}

async function findAppPackageJsonPath(): Promise<string | null> {
  const cwdPackageJson = path.join(process.cwd(), 'package.json');
  if (!(await fs.pathExists(cwdPackageJson))) {
    return null;
  }

  return cwdPackageJson;
}

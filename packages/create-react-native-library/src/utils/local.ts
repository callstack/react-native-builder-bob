import fs from 'fs-extra';
import path from 'path';
import type { TemplateConfiguration } from '../template';

type PackageJson = {
  dependencies?: Record<string, string>;
};

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

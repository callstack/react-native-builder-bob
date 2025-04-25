import fs from 'fs-extra';
import path from 'path';

export async function determinePackageManager() {
  return (await fs.pathExists(path.join(process.cwd(), 'yarn.lock')))
    ? 'yarn'
    : 'npm';
}

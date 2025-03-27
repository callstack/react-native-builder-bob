import fs from 'fs-extra';
import { join, resolve, isAbsolute } from 'path';

export async function getProjectRoot(argv: { cwd?: string }) {
  const root = argv.cwd
    ? isAbsolute(argv.cwd)
      ? argv.cwd
      : resolve(process.cwd(), argv.cwd)
    : process.cwd();

  if (await fs.pathExists(join(root, 'package.json'))) {
    return root;
  }

  throw new Error(
    `Couldn't find a 'package.json' file in '${root}'. Are you in a project folder?`
  );
}

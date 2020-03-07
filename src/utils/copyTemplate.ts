import path from 'path';
import fs from 'fs-extra';
import ejs from 'ejs';
import { ProjectOptions } from '../types';

const TEMPLATE = path.resolve(__dirname, '../../templates/library');
const BINARIES = /(gradlew|\.(jar|keystore|png|jpg|gif))$/;

const copyDir = async (
  source: string,
  dest: string,
  options: ProjectOptions,
  isRootDir: boolean
) => {
  await fs.mkdirp(dest);

  let files = await fs.readdir(source);

  if (options.project.includeNative === false && isRootDir === true) {
    const nativeFilesRegex = new RegExp('ios|android|podspec$');
    files = files.filter(file => !nativeFilesRegex.test(file));
  }

  for (const f of files) {
    const target = path.join(dest, ejs.render(f.replace(/^\$/, ''), options));

    const file = path.join(source, f);
    const stats = await fs.stat(file);

    if (stats.isDirectory()) {
      await copyDir(file, target, options, false);
    } else if (!file.match(BINARIES)) {
      const content = await fs.readFile(file, 'utf8');

      await fs.writeFile(target, ejs.render(content, options));
    } else {
      await fs.copyFile(file, target);
    }
  }
};

const copyTemplate = async (dest: string, options: ProjectOptions) => {
  await copyDir(TEMPLATE, dest, options, true);
};

export default copyTemplate;

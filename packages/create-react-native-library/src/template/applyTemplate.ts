import path from 'path';
import fs from 'fs-extra';
import ejs from 'ejs';
import type { TemplateConfiguration } from './config';

const BINARIES = [
  /(gradlew|\.(jar|keystore|png|jpg|gif))$/,
  /\$\.yarn(?![a-z])/,
];

/**
 * This copies the template files and renders them via ejs
 */
export async function applyTemplate(
  config: TemplateConfiguration,
  source: string,
  destination: string
) {
  await fs.mkdirp(destination);

  const files = await fs.readdir(source);

  for (const f of files) {
    const target = path.join(
      destination,
      ejs.render(f.replace(/^\$/, ''), config, {
        openDelimiter: '{',
        closeDelimiter: '}',
      })
    );

    const file = path.join(source, f);
    const stats = await fs.stat(file);

    if (stats.isDirectory()) {
      await applyTemplate(config, file, target);
    } else if (!BINARIES.some((r) => r.test(file))) {
      const content = await fs.readFile(file, 'utf8');

      await fs.writeFile(target, ejs.render(content, config));
    } else {
      await fs.copyFile(file, target);
    }
  }
}

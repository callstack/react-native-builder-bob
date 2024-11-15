import path from 'path';
import fs from 'fs-extra';
import ejs from 'ejs';
import type { TemplateConfiguration } from './config';
import type { Answers } from 'create-react-native-library';

const BINARIES = [
  /(gradlew|\.(jar|keystore|png|jpg|gif))$/,
  /\$\.yarn(?![a-z])/,
];

const COMMON_FILES = path.resolve(__dirname, '../../templates/common');
const COMMON_EXAMPLE_FILES = path.resolve(
  __dirname,
  '../../templates/common-example'
);
const COMMON_LOCAL_FILES = path.resolve(
  __dirname,
  '../../templates/common-local'
);
const JS_FILES = path.resolve(__dirname, '../../templates/js-library');
const EXPO_FILES = path.resolve(__dirname, '../../templates/expo-library');
const CPP_FILES = path.resolve(__dirname, '../../templates/cpp-library');
const NATIVE_COMMON_FILES = path.resolve(
  __dirname,
  '../../templates/native-common'
);
const NATIVE_COMMON_EXAMPLE_FILES = path.resolve(
  __dirname,
  '../../templates/native-common-example'
);

const NATIVE_FILES = {
  module_legacy: path.resolve(
    __dirname,
    '../../templates/native-library-legacy'
  ),
  module_new: path.resolve(__dirname, '../../templates/native-library-new'),
  module_mixed: path.resolve(__dirname, '../../templates/native-library-mixed'),
  view_legacy: path.resolve(__dirname, '../../templates/native-view-legacy'),
  view_mixed: path.resolve(__dirname, '../../templates/native-view-mixed'),
  view_new: path.resolve(__dirname, '../../templates/native-view-new'),
} as const;

const OBJC_FILES = {
  module_common: path.resolve(__dirname, '../../templates/objc-library'),
  view_legacy: path.resolve(__dirname, '../../templates/objc-view-legacy'),
  view_mixed: path.resolve(__dirname, '../../templates/objc-view-mixed'),
  view_new: path.resolve(__dirname, '../../templates/objc-view-new'),
} as const;

const KOTLIN_FILES = {
  module_legacy: path.resolve(
    __dirname,
    '../../templates/kotlin-library-legacy'
  ),
  module_new: path.resolve(__dirname, '../../templates/kotlin-library-new'),
  module_mixed: path.resolve(__dirname, '../../templates/kotlin-library-mixed'),
  view_legacy: path.resolve(__dirname, '../../templates/kotlin-view-legacy'),
  view_mixed: path.resolve(__dirname, '../../templates/kotlin-view-mixed'),
  view_new: path.resolve(__dirname, '../../templates/kotlin-view-new'),
} as const;

const SWIFT_FILES = {
  module_legacy: path.resolve(
    __dirname,
    '../../templates/swift-library-legacy'
  ),
  view_legacy: path.resolve(__dirname, '../../templates/swift-view-legacy'),
} as const;

export async function applyTemplates(
  answers: Answers,
  config: TemplateConfiguration,
  folder: string
) {
  const { local } = answers;
  if (local) {
    await applyTemplate(config, COMMON_LOCAL_FILES, folder);
  } else {
    await applyTemplate(config, COMMON_FILES, folder);

    if (config.example !== 'none') {
      await applyTemplate(config, COMMON_EXAMPLE_FILES, folder);
    }
  }

  if (answers.languages === 'js') {
    await applyTemplate(config, JS_FILES, folder);
    await applyTemplate(config, EXPO_FILES, folder);
  } else {
    await applyTemplate(config, NATIVE_COMMON_FILES, folder);

    if (config.example !== 'none') {
      await applyTemplate(config, NATIVE_COMMON_EXAMPLE_FILES, folder);
    }

    if (config.project.module) {
      await applyTemplate(
        config,
        NATIVE_FILES[`module_${config.project.arch}`],
        folder
      );
    } else {
      await applyTemplate(
        config,
        NATIVE_FILES[`view_${config.project.arch}`],
        folder
      );
    }

    if (config.project.swift) {
      await applyTemplate(config, SWIFT_FILES[`module_legacy`], folder);
    } else {
      if (config.project.module) {
        await applyTemplate(config, OBJC_FILES[`module_common`], folder);
      } else {
        await applyTemplate(
          config,
          OBJC_FILES[`view_${config.project.arch}`],
          folder
        );
      }
    }

    const templateType = `${config.project.module ? 'module' : 'view'}_${
      config.project.arch
    }` as const;

    await applyTemplate(config, KOTLIN_FILES[templateType], folder);

    if (config.project.cpp) {
      await applyTemplate(config, CPP_FILES, folder);
      await fs.remove(path.join(folder, 'ios', `${config.project.name}.m`));
    }
  }
}

/**
 * This copies the template files and renders them via ejs
 */
async function applyTemplate(
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

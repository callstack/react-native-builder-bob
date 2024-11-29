import path from 'path';
import fs from 'fs-extra';
import ejs from 'ejs';
import type { Answers, ExampleApp, SupportedArchitecture } from './input';

// Please think at least 5 times before introducing a new config key
// You can just reuse the existing ones most of the time
export type TemplateConfiguration = {
  bob: {
    version: string;
  };
  project: {
    slug: string;
    description: string;
    name: string;
    package: string;
    package_dir: string;
    package_cpp: string;
    identifier: string;
    native: boolean;
    nitro: boolean;
    arch: SupportedArchitecture;
    cpp: boolean;
    swift: boolean;
    view: boolean;
    module: boolean;
  };
  author: {
    name: string;
    email: string;
    url: string;
  };
  repo: string;
  example: ExampleApp;
  year: number;
};

const BINARIES = [
  /(gradlew|\.(jar|keystore|png|jpg|gif))$/,
  /\$\.yarn(?![a-z])/,
];

const COMMON_FILES = path.resolve(__dirname, '../templates/common');
const COMMON_LOCAL_FILES = path.resolve(__dirname, '../templates/common-local');
const EXAMPLE_COMMON_FILES = path.resolve(
  __dirname,
  '../templates/example-common'
);
const EXAMPLE_MODULE_LEGACY_FILES = path.resolve(
  __dirname,
  '../templates/example-module-legacy'
);
const EXAMPLE_MODULE_NEW_FILES = path.resolve(
  __dirname,
  '../templates/example-module-new'
);
const EXAMPLE_VIEW_FILES = path.resolve(__dirname, '../templates/example-view');

const JS_FILES = path.resolve(__dirname, '../templates/js-library');
const EXPO_FILES = path.resolve(__dirname, '../templates/expo-library');
const CPP_FILES = path.resolve(__dirname, '../templates/cpp-library');
const NATIVE_COMMON_FILES = path.resolve(
  __dirname,
  '../templates/native-common'
);
const NATIVE_COMMON_EXAMPLE_FILES = path.resolve(
  __dirname,
  '../templates/native-common-example'
);

const NATIVE_FILES = {
  module_legacy: path.resolve(__dirname, '../templates/native-library-legacy'),
  module_new: path.resolve(__dirname, '../templates/native-library-new'),
  view_legacy: path.resolve(__dirname, '../templates/native-view-legacy'),
  view_new: path.resolve(__dirname, '../templates/native-view-new'),
  module_nitro: path.resolve(__dirname, '../templates/nitro-module'),
} as const;

const OBJC_FILES = {
  module_common: path.resolve(__dirname, '../templates/objc-library'),
  view_legacy: path.resolve(__dirname, '../templates/objc-view-legacy'),
  view_new: path.resolve(__dirname, '../templates/objc-view-new'),
} as const;

const KOTLIN_FILES = {
  module_legacy: path.resolve(__dirname, '../templates/kotlin-library-legacy'),
  module_new: path.resolve(__dirname, '../templates/kotlin-library-new'),
  view_legacy: path.resolve(__dirname, '../templates/kotlin-view-legacy'),
  view_new: path.resolve(__dirname, '../templates/kotlin-view-new'),
} as const;

const SWIFT_FILES = {
  module_legacy: path.resolve(__dirname, '../templates/swift-library-legacy'),
  view_legacy: path.resolve(__dirname, '../templates/swift-view-legacy'),
} as const;

export function generateTemplateConfiguration({
  bobVersion,
  basename,
  answers,
}: {
  bobVersion: string;
  basename: string;
  answers: Answers;
}): TemplateConfiguration {
  const { slug, languages, type } = answers;

  const arch =
    type === 'legacy-module' || type === 'legacy-view' || type === 'library'
      ? 'legacy'
      : 'new';

  const project = slug.replace(/^(react-native-|@[^/]+\/)/, '');
  let namespace: string | undefined;

  if (slug.startsWith('@') && slug.includes('/')) {
    namespace = slug
      .split('/')[0]
      ?.replace(/[^a-z0-9]/g, '')
      .toLowerCase();
  }

  // Create a package identifier with specified namespace when possible
  const pack = `${namespace ? `${namespace}.` : ''}${project
    .replace(/[^a-z0-9]/g, '')
    .toLowerCase()}`;

  return {
    bob: {
      version: bobVersion,
    },
    project: {
      slug,
      description: answers.description,
      name:
        /^[A-Z]/.test(basename) && /^[a-z0-9]+$/i.test(basename)
          ? // If the project name is already in PascalCase, use it as-is
          basename
          : // Otherwise, convert it to PascalCase and remove any non-alphanumeric characters
          `${project.charAt(0).toUpperCase()}${project
            .replace(/[^a-z0-9](\w)/g, (_, $1) => $1.toUpperCase())
            .slice(1)}`,
      package: pack,
      package_dir: pack.replace(/\./g, '/'),
      package_cpp: pack.replace(/\./g, '_'),
      identifier: slug.replace(/[^a-z0-9]+/g, '-').replace(/^-/, ''),
      native: languages !== 'js',
      nitro: type.startsWith('nitro'),
      arch,
      cpp: languages === 'cpp',
      swift: languages === 'kotlin-swift',
      view: answers.type.endsWith('-view'),
      module: answers.type.endsWith('-module'),
    },
    author: {
      name: answers.authorName,
      email: answers.authorEmail,
      url: answers.authorUrl,
    },
    repo: answers.repoUrl,
    example: answers.example,
    year: new Date().getFullYear(),
  };
}

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
      await applyTemplate(config, EXAMPLE_COMMON_FILES, folder);

      if (config.project.view) {
        await applyTemplate(config, EXAMPLE_VIEW_FILES, folder);
      } else {
        if (config.project.arch === 'legacy') {
          await applyTemplate(config, EXAMPLE_MODULE_LEGACY_FILES, folder);
        } else {
          await applyTemplate(config, EXAMPLE_MODULE_NEW_FILES, folder);
        }
      }
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

    if (config.project.nitro) {
      await applyTemplate(config, NATIVE_FILES['module_nitro'], folder);
      return;
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

    const templateType = `${config.project.module ? 'module' : 'view'}_${config.project.arch
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

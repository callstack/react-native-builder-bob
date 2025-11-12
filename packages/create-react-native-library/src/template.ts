import path from 'path';
import fs from 'fs-extra';
import ejs from 'ejs';
import type { Answers, ExampleApp, ProjectType } from './input';

export type TemplateVersions = {
  bob: string;
  nitro: string | undefined;
};

export type ModuleConfig =
  | 'native-modules'
  | 'turbo-modules'
  | 'nitro-modules'
  | null;

export type ViewConfig = 'paper-view' | 'fabric-view' | 'nitro-view' | null;

// Please think at least 5 times before introducing a new config key
// You can just reuse the existing ones most of the time
export type TemplateConfiguration = {
  versions: TemplateVersions;
  project: {
    slug: string;
    description: string;
    name: string;
    package: string;
    package_dir: string;
    package_cpp: string;
    identifier: string;
    native: boolean;
    swift: boolean;
    viewConfig: ViewConfig;
    moduleConfig: ModuleConfig;
  };
  author: {
    name: string;
    email: string;
    url: string;
  };
  /** Git repo URL */
  repo: string;
  example: ExampleApp;
  year: number;
  tools: string[];
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
const EXAMPLE_MODULE_NEW_FILES = path.resolve(
  __dirname,
  '../templates/example-module-new'
);
const EXAMPLE_VIEW_FILES = path.resolve(__dirname, '../templates/example-view');

const JS_FILES = path.resolve(__dirname, '../templates/js-library');
const EXPO_FILES = path.resolve(__dirname, '../templates/expo-library');
const NATIVE_COMMON_FILES = path.resolve(
  __dirname,
  '../templates/native-common'
);
const NATIVE_COMMON_EXAMPLE_FILES = path.resolve(
  __dirname,
  '../templates/native-common-example'
);

const NATIVE_FILES = {
  module_new: path.resolve(__dirname, '../templates/native-library-new'),
  view_new: path.resolve(__dirname, '../templates/native-view-new'),
  module_nitro: path.resolve(__dirname, '../templates/nitro-module'),
  view_nitro: path.resolve(__dirname, '../templates/nitro-view'),
} as const;

const OBJC_FILES = {
  module_common: path.resolve(__dirname, '../templates/objc-library'),
  view_new: path.resolve(__dirname, '../templates/objc-view-new'),
} as const;

const KOTLIN_FILES = {
  module_new: path.resolve(__dirname, '../templates/kotlin-library-new'),
  view_new: path.resolve(__dirname, '../templates/kotlin-view-new'),
} as const;

export function generateTemplateConfiguration({
  versions,
  basename,
  answers,
}: {
  versions: TemplateVersions;
  basename: string;
  answers: Answers;
}): TemplateConfiguration {
  const { slug, languages, type } = answers;

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
    versions,
    project: {
      slug,
      description: answers.description,
      name:
        /^[A-Z]/.test(basename) && /^[a-z0-9]+$/i.test(basename)
          ? // If the project name is already in PascalCase, use it as-is
            basename
          : // Otherwise, convert it to PascalCase and remove any non-alphanumeric characters
            `${project.charAt(0).toUpperCase()}${project
              .replace(/[^a-z0-9](\w)/g, (_, $1: string) => $1.toUpperCase())
              .slice(1)}`,
      package: pack,
      package_dir: pack.replace(/\./g, path.sep),
      package_cpp: pack.replace(/\./g, '_'),
      identifier: slug.replace(/[^a-z0-9]+/g, '-').replace(/^-/, ''),
      native: languages !== 'js',
      swift: languages === 'kotlin-swift',
      viewConfig: getViewConfig(type),
      moduleConfig: getModuleConfig(type),
    },
    author: {
      name: answers.authorName,
      email: answers.authorEmail,
      url: answers.authorUrl,
    },
    repo: answers.repoUrl,
    example: answers.example,
    tools: answers.tools,
    year: new Date().getFullYear(),
  };
}

function getModuleConfig(projectType: ProjectType): ModuleConfig {
  switch (projectType) {
    case 'nitro-module':
      return 'nitro-modules';
    case 'turbo-module':
      return 'turbo-modules';
    case 'fabric-view':
    case 'library':
    case 'nitro-view':
      return null;
  }
}

function getViewConfig(projectType: ProjectType): ViewConfig {
  switch (projectType) {
    case 'fabric-view':
      return 'fabric-view';
    case 'nitro-view':
      return 'nitro-view';
    case 'nitro-module':
    case 'turbo-module':
    case 'library':
    default:
      return null;
  }
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

      if (config.project.viewConfig !== null) {
        await applyTemplate(config, EXAMPLE_VIEW_FILES, folder);
      } else {
        await applyTemplate(config, EXAMPLE_MODULE_NEW_FILES, folder);
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

    if (config.project.moduleConfig === 'nitro-modules') {
      await applyTemplate(config, NATIVE_FILES['module_nitro'], folder);
      return;
    }

    if (config.project.viewConfig === 'nitro-view') {
      await applyTemplate(config, NATIVE_FILES['view_nitro'], folder);
      return;
    }

    if (config.project.moduleConfig !== null) {
      await applyTemplate(config, NATIVE_FILES[`module_new`], folder);
    } else {
      await applyTemplate(config, NATIVE_FILES[`view_new`], folder);
    }

    if (config.project.moduleConfig !== null) {
      await applyTemplate(config, OBJC_FILES[`module_common`], folder);
    } else {
      await applyTemplate(config, OBJC_FILES[`view_new`], folder);
    }

    const templateType = `${
      config.project.moduleConfig !== null ? 'module' : 'view'
    }_new` as const;

    await applyTemplate(config, KOTLIN_FILES[templateType], folder);
  }
}

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
    let name;

    try {
      name = ejs.render(f.replace(/^\$/, ''), config, {
        openDelimiter: '{',
        closeDelimiter: '}',
      });
    } catch (e) {
      throw new Error(`Failed to render template file name: ${f}`, {
        cause: e,
      });
    }

    const target = path.join(destination, name);

    const file = path.join(source, f);
    const stats = await fs.stat(file);

    if (stats.isDirectory()) {
      await applyTemplate(config, file, target);
    } else if (!BINARIES.some((r) => r.test(file))) {
      const content = await fs.readFile(file, 'utf8');

      let result;

      try {
        result = ejs
          .render(content, config)
          // Make sure that line endings are 'lf' (Unix style)
          .replace(/\r\n/g, '\n');
      } catch (e) {
        throw new Error(`Failed to render template file content: ${f}`, {
          cause: e,
        });
      }

      await fs.writeFile(target, result);
    } else {
      await fs.copyFile(file, target);
    }
  }
}

import type { Answers } from 'create-react-native-library';

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

export type SupportedArchitecture = 'new' | 'mixed' | 'legacy';
export type ExampleApp = 'none' | 'test-app' | 'expo' | 'vanilla';

export function generateTemplateConfiguration({
  bobVersion,
  basename,
  answers,
}: {
  bobVersion: string;
  basename: string;
  answers: Required<Answers>;
}): TemplateConfiguration {
  const { slug, languages, type } = answers;

  const arch =
    type === 'module-new' || type === 'view-new'
      ? 'new'
      : type === 'module-mixed' || type === 'view-mixed'
      ? 'mixed'
      : 'legacy';

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
      arch,
      cpp: languages === 'cpp',
      swift: languages === 'kotlin-swift',
      view: answers.type.startsWith('view'),
      module: answers.type.startsWith('module'),
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

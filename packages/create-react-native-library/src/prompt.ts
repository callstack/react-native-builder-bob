import fs from 'node:fs';
import path from 'node:path';
import { create } from 'pigment';
import validateNpmPackage from 'validate-npm-package-name';
import { spawn } from './utils/spawn';
import githubUsername from 'github-username';
import { AVAILABLE_TOOLS } from './utils/configureTools';
import { SUPPORTED_REACT_NATIVE_VERSION } from './constants';

export type Answers = NonNullable<Awaited<ReturnType<typeof prompt.show>>>;

export type ExampleApp = 'test-app' | 'expo' | 'vanilla' | undefined;

export type ProjectLanguages = 'kotlin-objc' | 'kotlin-swift' | 'js';

export type ProjectType =
  | 'turbo-module'
  | 'fabric-view'
  | 'nitro-module'
  | 'nitro-view'
  | 'library';

const TYPE_CHOICES: {
  title: string;
  value: ProjectType;
  description: string;
}[] = [
  {
    title: 'Turbo module',
    value: 'turbo-module',
    description: 'Integration for native APIs to JS',
  },
  {
    title: 'Fabric view',
    value: 'fabric-view',
    description: 'Integration for native views to JS',
  },
  {
    title: 'Nitro module',
    value: 'nitro-module',
    description: 'Type-safe, fast integration for native APIs to JS',
  },
  {
    title: 'Nitro view',
    value: 'nitro-view',
    description: 'Integration for native views to JS using nitro',
  },
  {
    title: 'JavaScript library',
    value: 'library',
    description: 'Plain JavaScript library with Web support',
  },
];

const LANGUAGE_CHOICES: {
  title: string;
  value: ProjectLanguages;
  types: ProjectType[];
}[] = [
  {
    title: 'Kotlin & Swift',
    value: 'kotlin-swift',
    types: ['nitro-module', 'nitro-view'],
  },
  {
    title: 'Kotlin & Objective-C',
    value: 'kotlin-objc',
    types: ['turbo-module', 'fabric-view'],
  },
  {
    title: 'JavaScript for Android, iOS & Web',
    value: 'js',
    types: ['library'],
  },
];

const EXAMPLE_CHOICES = (
  [
    {
      title: 'App with Community CLI',
      value: 'vanilla',
      description: "Provides access to app's native code",
      disabled: false,
    },
    {
      title: 'Test App by Microsoft',
      value: 'test-app',
      description: "App's native code is abstracted away",
      // Test App currently doesn't work with React Native 0.79.2
      // due to missing `Gemfile` in the template
      disabled: !process.env.CRNL_ENABLE_TEST_APP,
    },
    {
      title: 'App with Expo CLI',
      value: 'expo',
      description: 'Managed expo app with web support',
      disabled: false,
    },
  ] as const
).filter((choice) => !choice.disabled);

const validateDirectory = (input: string) => {
  if (!input) {
    return 'Cannot be empty';
  }

  const targetPath = path.join(process.cwd(), input);

  if (!fs.existsSync(targetPath)) {
    return true;
  }

  const stat = fs.statSync(targetPath);

  if (!stat.isDirectory()) {
    return 'Path exists and is not a directory';
  }

  const files = fs.readdirSync(targetPath);

  const isEmpty =
    files.length === 0 || (files.length === 1 && files[0] === '.git');

  if (!isEmpty) {
    return 'Directory already exists and is not empty';
  }

  return true;
};

const getGitConfig = async (key: string): Promise<string | undefined> => {
  try {
    const value: string = await spawn('git', ['config', '--get', key]);

    return value.trim();
  } catch {
    return undefined;
  }
};

const isInPackage = (): boolean => {
  try {
    const stat = fs.statSync(path.resolve(process.cwd(), 'package.json'));

    return stat.isFile();
  } catch {
    return false;
  }
};

export const prompt = create(['[name]'], {
  local: {
    type: 'confirm',
    description: 'Whether to create a local library',
    message: `Looks like you're under a project folder. Do you want to create a local library?`,
    default: isInPackage,
    skip: () => !isInPackage(),
  },
  directory: {
    type: 'text',
    description: 'Directory to create the library at',
    message: 'Where do you want to create the library?',
    default: (): string | undefined => {
      const answers = prompt.read();

      if (answers.name == null) {
        return undefined;
      }

      if (answers.local && !answers.name?.includes(path.sep)) {
        return path.join('modules', answers.name);
      }

      return answers.name;
    },
    validate: validateDirectory,
    skip: () => {
      const answers = prompt.read();

      if (
        answers.name &&
        !answers.local &&
        validateDirectory(answers.name) === true
      ) {
        return true;
      }

      return false;
    },
  },
  slug: {
    type: 'text',
    description: 'Name of the npm package',
    message: 'What do you want to name the npm package?',
    default: (): string | undefined => {
      const answers = prompt.read();
      const value =
        typeof answers.directory === 'string'
          ? answers.directory
          : answers.name;

      if (typeof value !== 'string') {
        return undefined;
      }

      const basename = path.basename(value);

      if (validateNpmPackage(basename).validForNewPackages) {
        if (/^(@|react-native)/.test(basename)) {
          return basename;
        }

        return `react-native-${basename}`;
      }

      return undefined;
    },
    validate: (input) =>
      validateNpmPackage(input).validForNewPackages ||
      'Must be a valid npm package name',
    required: true,
  },
  description: {
    type: 'text',
    description: 'Description of the npm package',
    message: 'How would you describe the package?',
    validate: (input) => Boolean(input) || 'Cannot be empty',
    required: true,
  },
  authorName: {
    type: 'text',
    description: 'Name of the package author',
    message: 'What is the name of the package author?',
    default: async () => getGitConfig('user.name'),
    validate: (input) => Boolean(input) || 'Cannot be empty',
    skip: (): boolean => prompt.read().local === true,
  },
  authorEmail: {
    type: 'text',
    description: 'Email address of the package author',
    message: 'What is the email address of the package author?',
    default: async () => getGitConfig('user.email'),
    validate: (input) =>
      /^\S+@\S+$/.test(input) || 'Must be a valid email address',
    skip: (): boolean => prompt.read().local === true,
  },
  authorUrl: {
    type: 'text',
    description: 'Profile URL of the package author',
    message: 'What is the profile URL for the package author?',
    default: async () => {
      const answers = prompt.read();

      if (typeof answers.authorEmail !== 'string') {
        return undefined;
      }

      try {
        const username = await githubUsername(answers.authorEmail);

        if (username) {
          return `https://github.com/${username}`;
        }
      } catch (e) {
        // Ignore error
      }

      return undefined;
    },
    validate: (input) => /^https?:\/\//.test(input) || 'Must be a valid URL',
    skip: (): boolean => prompt.read().local === true,
  },
  repoUrl: {
    type: 'text',
    description: 'Repository URL of the package',
    message: 'What is the repository URL for the package?',
    default: (): string | undefined => {
      const answers = prompt.read();

      if (
        typeof answers.authorUrl === 'string' &&
        typeof answers.slug === 'string' &&
        /^https?:\/\/github.com\/[^/]+/.test(answers.authorUrl)
      ) {
        return `${answers.authorUrl}/${answers.slug
          .replace(/^@/, '')
          .replace(/\//g, '-')}`;
      }

      return undefined;
    },
    validate: (input) => /^https?:\/\//.test(input) || 'Must be a valid URL',
    skip: (): boolean => prompt.read().local === true,
  },
  type: {
    type: 'select',
    description: 'Type of library you want to develop',
    message: 'What type of library do you want to develop?',
    choices: TYPE_CHOICES,
    required: true,
  },
  languages: {
    type: 'select',
    description: 'Languages to use for native code',
    message: 'Which language do you want to use for native code?',
    choices: LANGUAGE_CHOICES.map((choice) => ({
      title: choice.title,
      value: choice.value,
      skip: (): boolean => {
        const answers = prompt.read();

        if (typeof answers.type === 'string') {
          return !choice.types.includes(answers.type);
        }

        return false;
      },
    })),
    required: true,
  },
  example: {
    type: 'select',
    description: 'Type of the example app to create',
    message: 'What type of example app do you want to create?',
    choices: EXAMPLE_CHOICES.map((choice) => ({
      title: choice.title,
      value: choice.value,
      description: choice.description,
      skip: (): boolean => {
        const answers = prompt.read();

        if (typeof answers.type === 'string') {
          return answers.type === 'library'
            ? choice.value !== 'expo'
            : choice.value === 'expo';
        }

        return false;
      },
    })),
    required: true,
    skip: (): boolean => {
      const answers = prompt.read();

      return answers.local === true;
    },
  },
  tools: {
    type: 'multiselect',
    description: 'Additional tools to configure',
    message: 'Which tools do you want to configure?',
    choices: Object.entries(AVAILABLE_TOOLS).map(([key, tool]) => ({
      value: key,
      title: tool.name,
      description: tool.description,
    })),
    default: Object.keys(AVAILABLE_TOOLS),
    required: true,
    skip: (): boolean => {
      const answers = prompt.read();

      return answers.local === true;
    },
  },
  reactNativeVersion: {
    type: 'text',
    description: 'Version of React Native to use in the example app',
    message:
      'Which version of React Native do you want to use in the example app?',
    default: SUPPORTED_REACT_NATIVE_VERSION,
    validate: (input) =>
      input === 'latest' ||
      /^\d+\.\d+\.\d+(-.+)?$/.test(input) ||
      'Must be a valid semver version',
    skip: true,
  },
});

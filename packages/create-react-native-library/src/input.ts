import fs from 'fs-extra';
import githubUsername from 'github-username';
import path from 'path';
import validateNpmPackage from 'validate-npm-package-name';
import type * as yargs from 'yargs';
import { version } from '../package.json';
import { SUPPORTED_REACT_NATIVE_VERSION } from './constants';
import type { Question } from './utils/prompt';
import { spawn } from './utils/spawn';

export type ProjectLanguages = 'kotlin-objc' | 'kotlin-swift' | 'js';

export type ProjectType =
  | 'turbo-module'
  | 'fabric-view'
  | 'nitro-module'
  | 'nitro-view'
  | 'library';

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
      description: "provides access to app's native code",
      disabled: false,
    },
    {
      title: 'Test App by Microsoft',
      value: 'test-app',
      description: "app's native code is abstracted away",
      // Test App currently doesn't work with React Native 0.79.2
      // due to missing `Gemfile` in the template
      disabled: !process.env.CRNL_ENABLE_TEST_APP,
    },
    {
      title: 'App with Expo CLI',
      value: 'expo',
      description: 'managed expo app with web support',
      disabled: false,
    },
  ] as const
).filter((choice) => !choice.disabled);

const TYPE_CHOICES: {
  title: string;
  value: ProjectType;
  description: string;
}[] = [
  {
    title: 'Turbo module',
    value: 'turbo-module',
    description: 'integration for native APIs to JS',
  },
  {
    title: 'Fabric view',
    value: 'fabric-view',
    description: 'integration for native views to JS',
  },
  {
    title: 'Nitro module',
    value: 'nitro-module',
    description:
      'type-safe, fast integration for native APIs to JS (experimental)',
  },
  {
    title: 'Nitro view',
    value: 'nitro-view',
    description:
      'integration for native views to JS using nitro for prop parsing (experimental)',
  },
  {
    title: 'JavaScript library',
    value: 'library',
    description: 'supports Expo Go and Web',
  },
];

export const acceptedArgs = {
  'slug': {
    description: 'Name of the npm package',
    type: 'string',
  },
  'description': {
    description: 'Description of the npm package',
    type: 'string',
  },
  'author-name': {
    description: 'Name of the package author',
    type: 'string',
  },
  'author-email': {
    description: 'Email address of the package author',
    type: 'string',
  },
  'author-url': {
    description: 'URL for the package author',
    type: 'string',
  },
  'repo-url': {
    description: 'URL for the repository',
    type: 'string',
  },
  'languages': {
    description: 'Languages you want to use',
    choices: LANGUAGE_CHOICES.map(({ value }) => value),
  },
  'type': {
    description: 'Type of library you want to develop',
    choices: TYPE_CHOICES.map(({ value }) => value),
  },
  'react-native-version': {
    description: 'Version of React Native to use',
    type: 'string',
    default: SUPPORTED_REACT_NATIVE_VERSION,
  },
  'local': {
    description: 'Whether to create a local library',
    type: 'boolean',
  },
  'example': {
    description: 'Type of the example app to create',
    type: 'string',
    choices: EXAMPLE_CHOICES.map(({ value }) => value),
  },
  'interactive': {
    description: 'Whether to run in interactive mode',
    type: 'boolean',
  },
} as const satisfies Record<string, yargs.Options>;

export type ExampleApp = 'none' | 'test-app' | 'expo' | 'vanilla';

type PromptAnswers = {
  directory: string;
  slug: string;
  description: string;
  authorName: string;
  authorEmail: string;
  authorUrl: string;
  repoUrl: string;
  languages: ProjectLanguages;
  type: ProjectType;
  example: ExampleApp;
  local: boolean;
};

export type Answers = PromptAnswers & {
  name?: string;
  reactNativeVersion?: string;
  interactive?: boolean;
};

export async function createQuestions({
  name,
  local,
}: {
  name?: string;
  local?: boolean;
}) {
  let fullname, email;

  try {
    fullname = await spawn('git', ['config', '--get', 'user.name']);
    email = await spawn('git', ['config', '--get', 'user.email']);
  } catch (e) {
    // Ignore error
  }

  const questions: Question<keyof PromptAnswers>[] = [
    {
      type:
        local == null &&
        (await fs.pathExists(path.join(process.cwd(), 'package.json')))
          ? 'confirm'
          : null,
      name: 'local',
      message: `Looks like you're under a project folder. Do you want to create a local library?`,
      initial: local,
      default: false,
    },
    {
      type: (_, answers) => (name && !(answers.local ?? local) ? null : 'text'),
      name: 'directory',
      message: `Where do you want to create the library?`,
      initial: (_, answers) => {
        if ((answers.local ?? local) && name && !name?.includes(path.sep)) {
          return path.join('modules', name);
        }

        return name ?? '';
      },
      validate: (input) => {
        if (!input) {
          return 'Cannot be empty';
        }

        const targetPath = path.join(process.cwd(), input);

        if (fs.pathExistsSync(targetPath)) {
          const stat = fs.statSync(targetPath);

          if (!stat.isDirectory()) {
            return 'Path exists and is not a directory';
          }

          const files = fs.readdirSync(targetPath);

          const isEmpty =
            files.length === 0 || (files.length === 1 && files[0] === '.git');

          if (!isEmpty) {
            return 'Directory already exists';
          }
        }

        return true;
      },
      default: name,
    },
    {
      type: 'text',
      name: 'slug',
      message: 'What is the name of the npm package?',
      initial: (_, answers) => {
        const basename = path.basename(
          typeof answers.directory === 'string'
            ? answers.directory
            : (name ?? '')
        );

        if (validateNpmPackage(basename).validForNewPackages) {
          if (/^(@|react-native)/.test(basename)) {
            return basename;
          }

          return `react-native-${basename}`;
        }

        return '';
      },
      validate: (input) =>
        validateNpmPackage(input).validForNewPackages ||
        'Must be a valid npm package name',
    },
    {
      type: 'text',
      name: 'description',
      message: 'What is the description for the package?',
      validate: (input) => Boolean(input) || 'Cannot be empty',
    },
    {
      type: (_, answers) => ((answers.local ?? local) ? null : 'text'),
      name: 'authorName',
      message: 'What is the name of package author?',
      initial: fullname,
      validate: (input) => Boolean(input) || 'Cannot be empty',
    },
    {
      type: (_, answers) => ((answers.local ?? local) ? null : 'text'),
      name: 'authorEmail',
      message: 'What is the email address for the package author?',
      initial: email,
      validate: (input) =>
        /^\S+@\S+$/.test(input) || 'Must be a valid email address',
    },
    {
      type: (_, answers) => ((answers.local ?? local) ? null : 'text'),
      name: 'authorUrl',
      message: 'What is the URL for the package author?',
      initial: async (_, answers) => {
        if (typeof answers.authorEmail !== 'string') {
          return '';
        }

        try {
          const username = await githubUsername(answers.authorEmail);

          if (username) {
            return `https://github.com/${username}`;
          }
        } catch (e) {
          // Ignore error
        }

        return '';
      },
      validate: (input) => /^https?:\/\//.test(input) || 'Must be a valid URL',
    },
    {
      type: (_, answers) => ((answers.local ?? local) ? null : 'text'),
      name: 'repoUrl',
      message: 'What is the URL for the repository?',
      initial: (_, answers) => {
        if (
          typeof answers.authorUrl === 'string' &&
          typeof answers.slug === 'string' &&
          /^https?:\/\/github.com\/[^/]+/.test(answers.authorUrl)
        ) {
          return `${answers.authorUrl}/${answers.slug
            .replace(/^@/, '')
            .replace(/\//g, '-')}`;
        }

        return '';
      },
      validate: (input) => /^https?:\/\//.test(input) || 'Must be a valid URL',
    },
    {
      type: 'select',
      name: 'type',
      message: 'What type of library do you want to develop?',
      choices: TYPE_CHOICES,
    },
    {
      type: 'select',
      name: 'languages',
      message: 'Which languages do you want to use?',
      choices: (_, values) => {
        return LANGUAGE_CHOICES.filter((choice) => {
          if (choice.types && typeof values.type === 'string') {
            // @ts-expect-error `includes doesn't support checking arbitrary types
            return choice.types.includes(values.type);
          }

          return true;
        });
      },
    },
    {
      type: 'select',
      name: 'example',
      message: 'What type of example app do you want to create?',
      choices: (_, values) => {
        if (local) {
          return [
            {
              title: 'None',
              value: 'none',
            },
          ];
        }

        return EXAMPLE_CHOICES.filter((choice) => {
          if (values.type) {
            return values.type === 'library'
              ? choice.value === 'expo'
              : choice.value !== 'expo';
          }

          return true;
        });
      },
    },
  ];

  return questions;
}

export function createMetadata(answers: Partial<PromptAnswers>) {
  // Some of the passed args can already be derived from the generated package.json file.
  const ignoredAnswers: (keyof Answers)[] = [
    'name',
    'directory',
    'slug',
    'description',
    'authorName',
    'authorEmail',
    'authorUrl',
    'repoUrl',
    'example',
    'reactNativeVersion',
    'local',
    'interactive',
  ];

  type AnswerEntries<T extends keyof PromptAnswers = keyof PromptAnswers> = [
    T,
    PromptAnswers[T],
  ][];

  const libraryMetadata = Object.fromEntries(
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    (Object.entries(answers) as AnswerEntries).filter(
      ([answer]) => !ignoredAnswers.includes(answer)
    )
  );

  libraryMetadata.version = version;

  return libraryMetadata;
}

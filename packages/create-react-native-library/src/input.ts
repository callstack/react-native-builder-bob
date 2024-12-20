import githubUsername from 'github-username';
import validateNpmPackage from 'validate-npm-package-name';
import type yargs from 'yargs';
import { version } from '../package.json';
import type { Question } from './utils/prompt';
import { spawn } from './utils/spawn';

export type ArgName =
  | 'slug'
  | 'description'
  | 'authorName'
  | 'authorEmail'
  | 'authorUrl'
  | 'repoUrl'
  | 'languages'
  | 'type'
  | 'local'
  | 'example'
  | 'reactNativeVersion';

export type ProjectLanguages = 'kotlin-objc' | 'kotlin-swift' | 'cpp' | 'js';

export type ProjectType =
  | 'turbo-module'
  | 'fabric-view'
  | 'legacy-module'
  | 'legacy-view'
  | 'nitro-module'
  | 'library';

const LANGUAGE_CHOICES: {
  title: string;
  value: ProjectLanguages;
  types: ProjectType[];
}[] = [
  {
    title: 'Kotlin & Swift',
    value: 'kotlin-swift',
    types: ['nitro-module', 'legacy-module', 'legacy-view'],
  },
  {
    title: 'Kotlin & Objective-C',
    value: 'kotlin-objc',
    types: ['turbo-module', 'fabric-view', 'legacy-module', 'legacy-view'],
  },
  {
    title: 'C++ for Android & iOS',
    value: 'cpp',
    types: ['turbo-module', 'legacy-module'],
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
      title: 'React Native Test App by Microsoft',
      value: 'test-app',
      description: "app's native code is abstracted away",
      // The test app is disabled for now until proper
      // Codegen spec shipping is implemented
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
    title: 'Nitro module',
    value: 'nitro-module',
    description:
      'type-safe, fast integration for native APIs to JS (experimental)',
  },
  {
    title: 'Fabric view',
    value: 'fabric-view',
    description: 'integration for native views to JS',
  },
  {
    title: 'Legacy Native module',
    value: 'legacy-module',
    description: 'bridge for native APIs to JS (old architecture)',
  },
  {
    title: 'Legacy Native view',
    value: 'legacy-view',
    description: 'bridge for native views to JS (old architecture)',
  },
  {
    title: 'JavaScript library',
    value: 'library',
    description: 'supports Expo Go and Web',
  },
];

export const acceptedArgs: Record<ArgName, yargs.Options> = {
  slug: {
    description: 'Name of the npm package',
    type: 'string',
  },
  description: {
    description: 'Description of the npm package',
    type: 'string',
  },
  authorName: {
    description: 'Name of the package author',
    type: 'string',
  },
  authorEmail: {
    description: 'Email address of the package author',
    type: 'string',
  },
  authorUrl: {
    description: 'URL for the package author',
    type: 'string',
  },
  repoUrl: {
    description: 'URL for the repository',
    type: 'string',
  },
  languages: {
    description: 'Languages you want to use',
    choices: LANGUAGE_CHOICES.map(({ value }) => value),
  },
  type: {
    description: 'Type of library you want to develop',
    choices: TYPE_CHOICES.map(({ value }) => value),
  },
  reactNativeVersion: {
    description: 'Version of React Native to use, uses latest if not specified',
    type: 'string',
  },
  local: {
    description: 'Whether to create a local library',
    type: 'boolean',
  },
  example: {
    description: 'Type of the example app to create',
    type: 'string',
    choices: EXAMPLE_CHOICES.map(({ value }) => value),
  },
} as const;

export type Args = Record<ArgName | 'name', string>;
export type SupportedArchitecture = 'new' | 'legacy';
export type ExampleApp = 'none' | 'test-app' | 'expo' | 'vanilla';

export type Answers = {
  name: string;
  slug: string;
  description: string;
  authorName: string;
  authorEmail: string;
  authorUrl: string;
  repoUrl: string;
  languages: ProjectLanguages;
  type: ProjectType;
  example: ExampleApp;
  reactNativeVersion?: string;
  local?: boolean;
};

export async function createQuestions({
  basename,
  local,
}: {
  basename: string;
  local: boolean;
}) {
  let name, email;

  try {
    name = await spawn('git', ['config', '--get', 'user.name']);
    email = await spawn('git', ['config', '--get', 'user.email']);
  } catch (e) {
    // Ignore error
  }

  const questions: Question<keyof Answers>[] = [
    {
      type: 'text',
      name: 'slug',
      message: 'What is the name of the npm package?',
      initial: validateNpmPackage(basename).validForNewPackages
        ? /^(@|react-native)/.test(basename)
          ? basename
          : `react-native-${basename}`
        : undefined,
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
      type: local ? null : 'text',
      name: 'authorName',
      message: 'What is the name of package author?',
      initial: name,
      validate: (input) => Boolean(input) || 'Cannot be empty',
    },
    {
      type: local ? null : 'text',
      name: 'authorEmail',
      message: 'What is the email address for the package author?',
      initial: email,
      validate: (input) =>
        /^\S+@\S+$/.test(input) || 'Must be a valid email address',
    },
    {
      type: local ? null : 'text',
      name: 'authorUrl',
      message: 'What is the URL for the package author?',
      // @ts-expect-error this is supported, but types are wrong
      initial: async (previous: string) => {
        try {
          const username = await githubUsername(previous);

          return `https://github.com/${username}`;
        } catch (e) {
          // Ignore error
        }

        return undefined;
      },
      validate: (input) => /^https?:\/\//.test(input) || 'Must be a valid URL',
    },
    {
      type: local ? null : 'text',
      name: 'repoUrl',
      message: 'What is the URL for the repository?',
      initial: (_: string, answers: Answers) => {
        if (/^https?:\/\/github.com\/[^/]+/.test(answers.authorUrl)) {
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
          if (choice.types) {
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

export function createMetadata(answers: Answers) {
  // Some of the passed args can already be derived from the generated package.json file.
  const ignoredAnswers: (keyof Answers)[] = [
    'name',
    'slug',
    'description',
    'authorName',
    'authorEmail',
    'authorUrl',
    'repoUrl',
    'example',
    'reactNativeVersion',
    'local',
  ];

  type AnswerEntries<T extends keyof Answers = keyof Answers> = [
    T,
    Answers[T],
  ][];

  const libraryMetadata = Object.fromEntries(
    (Object.entries(answers) as AnswerEntries).filter(
      ([answer]) => !ignoredAnswers.includes(answer)
    )
  );

  libraryMetadata.version = version;

  return libraryMetadata;
}

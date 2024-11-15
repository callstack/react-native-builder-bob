import path from 'path';
import fs from 'fs-extra';
import dedent from 'dedent';
import kleur from 'kleur';
import yargs from 'yargs';
import ora from 'ora';
import assert from 'node:assert';
import validateNpmPackage from 'validate-npm-package-name';
import githubUsername from 'github-username';
import prompts, { type PromptObject } from './utils/prompts';
import generateExampleApp, {
  type ExampleType,
} from './exampleApp/generateExampleApp';
import { spawn } from './utils/spawn';
import { version } from '../package.json';
import { addCodegenBuildScript } from './exampleApp/addCodegenBuildScript';
import { createInitialGitCommit } from './utils/initialCommit';
import { assertAnswers, assertNpx } from './utils/assert';
import { resolveBobVersionWithFallback } from './utils/promiseWithFallback';
import { generateTemplateConfiguration } from './template/config';
import { applyTemplates } from './template/applyTemplate';

const FALLBACK_BOB_VERSION = '0.32.0';

type ArgName =
  | 'slug'
  | 'description'
  | 'author-name'
  | 'author-email'
  | 'author-url'
  | 'repo-url'
  | 'languages'
  | 'type'
  | 'local'
  | 'example'
  | 'react-native-version';

type ProjectLanguages = 'kotlin-objc' | 'kotlin-swift' | 'cpp' | 'js';

type ProjectType =
  | 'module-legacy'
  | 'module-new'
  | 'module-mixed'
  | 'view-mixed'
  | 'view-new'
  | 'view-legacy'
  | 'library';

export type Answers = {
  name: string;
  slug: string;
  description: string;
  authorName: string;
  authorEmail: string;
  authorUrl: string;
  repoUrl: string;
  languages: ProjectLanguages;
  type?: ProjectType;
  example?: ExampleType;
  reactNativeVersion?: string;
  local?: boolean;
};

const LANGUAGE_CHOICES: {
  title: string;
  value: ProjectLanguages;
  types: ProjectType[];
}[] = [
  {
    title: 'Kotlin & Objective-C',
    value: 'kotlin-objc',
    types: [
      'module-legacy',
      'module-new',
      'module-mixed',
      'view-mixed',
      'view-new',
      'view-legacy',
    ],
  },
  {
    title: 'Kotlin & Swift',
    value: 'kotlin-swift',
    types: ['module-legacy', 'view-legacy'],
  },
  {
    title: 'C++ for Android & iOS',
    value: 'cpp',
    types: ['module-legacy', 'module-mixed', 'module-new'],
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
      title: 'Vanilla',
      value: 'vanilla',
      description: "provides access to app's native code",
      disabled: false,
    },
    {
      title: 'Test app',
      value: 'test-app',
      description: "app's native code is abstracted away",
      // The test app is disabled for now until proper
      // Codegen spec shipping is implemented
      disabled: !process.env.CRNL_ENABLE_TEST_APP,
    },
    {
      title: 'Expo',
      value: 'expo',
      description: 'managed expo project with web support',
      disabled: false,
    },
  ] as const
).filter((choice) => !choice.disabled);

const NEWARCH_DESCRIPTION = 'requires new arch (experimental)';
const BACKCOMPAT_DESCRIPTION = 'supports new arch (experimental)';

const TYPE_CHOICES: {
  title: string;
  value: ProjectType;
  description: string;
}[] = [
  {
    title: 'JavaScript library',
    value: 'library',
    description: 'supports Expo Go and Web',
  },
  {
    title: 'Native module',
    value: 'module-legacy',
    description: 'bridge for native APIs to JS',
  },
  {
    title: 'Native view',
    value: 'view-legacy',
    description: 'bridge for native views to JS',
  },
  {
    title: 'Turbo module with backward compat',
    value: 'module-mixed',
    description: BACKCOMPAT_DESCRIPTION,
  },
  {
    title: 'Turbo module',
    value: 'module-new',
    description: NEWARCH_DESCRIPTION,
  },
  {
    title: 'Fabric view with backward compat',
    value: 'view-mixed',
    description: BACKCOMPAT_DESCRIPTION,
  },
  {
    title: 'Fabric view',
    value: 'view-new',
    description: NEWARCH_DESCRIPTION,
  },
];

export type Question = Omit<
  PromptObject<keyof Answers>,
  'validate' | 'name'
> & {
  validate?: (value: string) => boolean | string;
  name: keyof Answers;
};

const args: Record<ArgName, yargs.Options> = {
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
    description: 'Version of React Native to use, uses latest if not specified',
    type: 'string',
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
};

// FIXME: fix the type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function create(_argv: yargs.Arguments<any>) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { _, $0, ...argv } = _argv;

  // Prefetch bob version in background while asking questions
  const resolveBobVersion = resolveBobVersionWithFallback(FALLBACK_BOB_VERSION);
  let local = false;

  if (typeof argv.local === 'boolean') {
    local = argv.local;
  } else {
    const hasPackageJson = await fs.pathExists(
      path.join(process.cwd(), 'package.json')
    );

    if (hasPackageJson) {
      // If we're under a project with package.json, ask the user if they want to create a local library
      const answers = await prompts({
        type: 'confirm',
        name: 'local',
        message: `Looks like you're under a project folder. Do you want to create a local library?`,
        initial: true,
      });

      local = answers.local;
    }
  }

  let folder: string;

  if (argv.name && !local) {
    folder = path.join(process.cwd(), argv.name);
  } else {
    const answers = await prompts({
      type: 'text',
      name: 'folder',
      message: `Where do you want to create the library?`,
      initial:
        local && argv.name && !argv.name.includes('/')
          ? `modules/${argv.name}`
          : argv.name,
      validate: (input) => {
        if (!input) {
          return 'Cannot be empty';
        }

        if (fs.pathExistsSync(path.join(process.cwd(), input))) {
          return 'Folder already exists';
        }

        return true;
      },
    });

    folder = path.join(process.cwd(), answers.folder);
  }

  if (await fs.pathExists(folder)) {
    console.log(
      `A folder already exists at ${kleur.blue(
        folder
      )}! Please specify another folder name or delete the existing one.`
    );

    process.exit(1);
  }

  await assertNpx();

  let name, email;

  try {
    name = await spawn('git', ['config', '--get', 'user.name']);
    email = await spawn('git', ['config', '--get', 'user.email']);
  } catch (e) {
    // Ignore error
  }

  const basename = path.basename(folder);

  const questions: Question[] = [
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
  ];

  if (!local) {
    questions.push({
      type: 'select',
      name: 'example',
      message: 'What type of example app do you want to create?',
      choices: (_, values) => {
        return EXAMPLE_CHOICES.filter((choice) => {
          if (values.type) {
            return values.type === 'library'
              ? choice.value === 'expo'
              : choice.value !== 'expo';
          }

          return true;
        });
      },
    });
  }

  assertAnswers(questions, argv);

  const singleChoiceAnswers: Partial<Answers> = {};
  const finalQuestions: Question[] = [];

  for (const question of questions) {
    // Skip questions which are passed as parameter and pass validation
    if (
      argv[question.name] != null &&
      question.validate?.(argv[question.name]) !== false
    ) {
      continue;
    }

    // Don't prompt questions with a single choice
    if (Array.isArray(question.choices) && question.choices.length === 1) {
      const onlyChoice = question.choices[0]!;
      singleChoiceAnswers[question.name] = onlyChoice.value;

      continue;
    }

    const { type, choices } = question;

    // Don't prompt dynamic questions with a single choice
    if (type === 'select' && typeof choices === 'function') {
      question.type = (prev, values, prompt) => {
        const dynamicChoices = choices(prev, { ...argv, ...values }, prompt);

        if (dynamicChoices && dynamicChoices.length === 1) {
          const onlyChoice = dynamicChoices[0]!;
          singleChoiceAnswers[question.name] = onlyChoice.value;
          return null;
        }

        return type;
      };
    }

    finalQuestions.push(question);
  }

  const promptAnswers = await prompts(finalQuestions);

  const answers = {
    ...argv,
    local,
    ...singleChoiceAnswers,
    ...promptAnswers,
  } as Required<Answers>;

  assertAnswers(questions, answers);

  const bobVersion = await resolveBobVersion();

  const config = generateTemplateConfiguration({
    bobVersion,
    basename,
    answers,
  });

  await fs.mkdirp(folder);

  if (answers.reactNativeVersion != null) {
    if (config.example === 'vanilla') {
      console.log(
        `${kleur.blue('ℹ')} Using ${kleur.cyan(
          `react-native@${answers.reactNativeVersion}`
        )} for the example`
      );
    } else {
      console.warn(
        `${kleur.yellow(
          '⚠'
        )} Ignoring --react-native-version for unsupported example type: ${kleur.cyan(
          config.example
        )}`
      );
    }
  }

  const spinner = ora().start();

  if (config.example !== 'none') {
    spinner.text = 'Generating example app';

    await generateExampleApp({
      type: config.example,
      dest: folder,
      arch: config.project.arch,
      project: config.project,
      bobVersion,
      reactNativeVersion: answers.reactNativeVersion,
    });
  }

  spinner.text = 'Copying files';

  await applyTemplates(answers, config, folder);

  const rootPackageJson = await fs.readJson(path.join(folder, 'package.json'));

  if (config.example !== 'none') {
    // Set `react` and `react-native` versions of root `package.json` from example `package.json`
    const examplePackageJson = await fs.readJSON(
      path.join(folder, 'example', 'package.json')
    );

    if (
      examplePackageJson.dependencies?.react &&
      examplePackageJson.dependencies?.['react-native']
    ) {
      rootPackageJson.devDependencies = rootPackageJson.devDependencies || {};
      rootPackageJson.devDependencies.react =
        examplePackageJson.dependencies.react;
      rootPackageJson.devDependencies['react-native'] =
        examplePackageJson.dependencies['react-native'];
    }

    if (config.example === 'vanilla') {
      // React Native doesn't provide the community CLI as a dependency.
      // We have to get read the version from the example app and put to the root package json
      const exampleCommunityCLIVersion =
        examplePackageJson.devDependencies['@react-native-community/cli'];
      assert(
        exampleCommunityCLIVersion !== undefined,
        "The generated example app doesn't have community CLI installed"
      );

      rootPackageJson.devDependencies = rootPackageJson.devDependencies || {};
      rootPackageJson.devDependencies['@react-native-community/cli'] =
        exampleCommunityCLIVersion;

      if (config.project.arch !== 'legacy') {
        addCodegenBuildScript(folder);
      }
    }
  }

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
  rootPackageJson['create-react-native-library'] = libraryMetadata;

  await fs.writeJson(path.join(folder, 'package.json'), rootPackageJson, {
    spaces: 2,
  });

  if (!local) {
    await createInitialGitCommit(folder);
  }

  spinner.succeed(
    `Project created successfully at ${kleur.yellow(
      path.relative(process.cwd(), folder)
    )}!\n`
  );

  if (local) {
    let linked;

    const packageManager = (await fs.pathExists(
      path.join(process.cwd(), 'yarn.lock')
    ))
      ? 'yarn'
      : 'npm';

    const packageJsonPath = path.join(process.cwd(), 'package.json');

    if (await fs.pathExists(packageJsonPath)) {
      const packageJson = await fs.readJSON(packageJsonPath);
      const isReactNativeProject = Boolean(
        packageJson.dependencies?.['react-native']
      );

      if (isReactNativeProject) {
        packageJson.dependencies = packageJson.dependencies || {};
        packageJson.dependencies[config.project.slug] =
          packageManager === 'yarn'
            ? `link:./${path.relative(process.cwd(), folder)}`
            : `file:./${path.relative(process.cwd(), folder)}`;

        await fs.writeJSON(packageJsonPath, packageJson, {
          spaces: 2,
        });

        linked = true;
      }
    }

    console.log(
      dedent(`
      ${kleur.magenta(
        `${kleur.bold('Get started')} with the project`
      )}${kleur.gray(':')}

      ${
        (linked
          ? `- Run ${kleur.blue(
              `${packageManager} install`
            )} to link the library\n`
          : `- Link the library at ${kleur.blue(
              path.relative(process.cwd(), folder)
            )} based on your project setup'\n`) +
        `- Run ${kleur.blue(
          'pod install --project-directory=ios'
        )} to install dependencies with CocoaPods\n` +
        `- Run ${kleur.blue('npx react-native run-android')} or ${kleur.blue(
          'npx react-native run-ios'
        )} to build and run the app\n` +
        `- Import from ${kleur.blue(
          config.project.slug
        )} and use it in your app.`
      }

      ${kleur.yellow(`Good luck!`)}
    `)
    );
  } else {
    const platforms = {
      ios: { name: 'iOS', color: 'cyan' },
      android: { name: 'Android', color: 'green' },
      ...(config.example === 'expo'
        ? ({ web: { name: 'Web', color: 'blue' } } as const)
        : null),
    } as const;

    console.log(
      dedent(`
      ${kleur.magenta(
        `${kleur.bold('Get started')} with the project`
      )}${kleur.gray(':')}

        ${kleur.gray('$')} yarn
      ${Object.entries(platforms)
        .map(
          ([script, { name, color }]) => `
      ${kleur[color](`Run the example app on ${kleur.bold(name)}`)}${kleur.gray(
        ':'
      )}

        ${kleur.gray('$')} yarn example ${script}`
        )
        .join('\n')}

      ${kleur.yellow(
        `See ${kleur.bold('CONTRIBUTING.md')} for more details. Good luck!`
      )}
    `)
    );
  }
}

yargs
  .command('$0 [name]', 'create a react native library', args, create)
  .demandCommand()
  .recommendCommands()
  .fail((message, error) => {
    console.log('\n');

    if (error) {
      console.log(kleur.red(error.message));
      throw error;
    }

    if (message) {
      console.log(kleur.red(message));
    } else {
      console.log(
        kleur.red(`An unknown error occurred. See '--help' for usage guide.`)
      );
    }

    process.exit(1);
  })
  .parserConfiguration({
    // don't pass kebab-case args to handler.
    'strip-dashed': true,
  })
  .strict().argv;

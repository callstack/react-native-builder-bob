import path from 'path';
import fs from 'fs-extra';
import ejs from 'ejs';
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
} from './utils/generateExampleApp';
import { spawn } from './utils/spawn';
import { version } from '../package.json';
import { addCodegenBuildScript } from './utils/addCodegenBuildScript';

const FALLBACK_BOB_VERSION = '0.29.0';

const BINARIES = [
  /(gradlew|\.(jar|keystore|png|jpg|gif))$/,
  /\$\.yarn(?![a-z])/,
];

const COMMON_FILES = path.resolve(__dirname, '../templates/common');
const COMMON_EXAMPLE_FILES = path.resolve(
  __dirname,
  '../templates/common-example'
);
const COMMON_LOCAL_FILES = path.resolve(__dirname, '../templates/common-local');
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
  module_mixed: path.resolve(__dirname, '../templates/native-library-mixed'),
  view_legacy: path.resolve(__dirname, '../templates/native-view-legacy'),
  view_mixed: path.resolve(__dirname, '../templates/native-view-mixed'),
  view_new: path.resolve(__dirname, '../templates/native-view-new'),
} as const;

const OBJC_FILES = {
  module_common: path.resolve(__dirname, '../templates/objc-library'),
  view_legacy: path.resolve(__dirname, '../templates/objc-view-legacy'),
  view_mixed: path.resolve(__dirname, '../templates/objc-view-mixed'),
  view_new: path.resolve(__dirname, '../templates/objc-view-new'),
} as const;

const KOTLIN_FILES = {
  module_legacy: path.resolve(__dirname, '../templates/kotlin-library-legacy'),
  module_new: path.resolve(__dirname, '../templates/kotlin-library-new'),
  module_mixed: path.resolve(__dirname, '../templates/kotlin-library-mixed'),
  view_legacy: path.resolve(__dirname, '../templates/kotlin-view-legacy'),
  view_mixed: path.resolve(__dirname, '../templates/kotlin-view-mixed'),
  view_new: path.resolve(__dirname, '../templates/kotlin-view-new'),
} as const;

const SWIFT_FILES = {
  module_legacy: path.resolve(__dirname, '../templates/swift-library-legacy'),
  view_legacy: path.resolve(__dirname, '../templates/swift-view-legacy'),
} as const;

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
  | 'skip-git'
  | 'replace-directory'
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

type Answers = {
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

const EXAMPLE_CHOICES = [
  {
    title: 'Vanilla',
    value: 'vanilla',
    description: "provides access to app's native code",
  },
  {
    title: 'Test app',
    value: 'test-app',
    description: "app's native code is abstracted away",
  },
  {
    title: 'Expo',
    value: 'expo',
    description: 'managed expo project with web support',
  },
  {
    title: 'None',
    value: 'none',
    description: 'no example app will be created',
  },
] as const;

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
  'skip-git': {
    description: 'Skip git actions',
    type: 'boolean',
  },
  'replace-directory': {
    description: 'Replaces the directory if it already exists.',
    type: 'boolean',
  },
};

// FIXME: fix the type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function create(_argv: yargs.Arguments<any>) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { _, $0, ...argv } = _argv;

  // Prefetch bob version in background while asking questions
  const bobVersionPromise = spawn('npm', [
    'view',
    'react-native-builder-bob',
    'dist-tags.latest',
  ]);

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

  let folder;

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

  if (!argv.replaceDirectory && (await fs.pathExists(folder))) {
    console.log(
      `A folder already exists at ${kleur.blue(
        folder
      )}! Please specify another folder name or delete the existing one.`
    );

    process.exit(1);
  }

  try {
    await spawn('npx', ['--help']);
  } catch (error) {
    // @ts-expect-error: TS doesn't know about `code`
    if (error != null && error.code === 'ENOENT') {
      console.log(
        `Couldn't find ${kleur.blue(
          'npx'
        )}! Please install it by running ${kleur.blue('npm install -g npx')}`
      );

      process.exit(1);
    } else {
      throw error;
    }
  }

  let name, email;

  try {
    name = await spawn('git', ['config', '--get', 'user.name']);
    email = await spawn('git', ['config', '--get', 'user.email']);
  } catch (e) {
    // Ignore error
  }

  const basename = path.basename(folder);

  const questions: (Omit<PromptObject<keyof Answers>, 'validate' | 'name'> & {
    validate?: (value: string) => boolean | string;
    name: string;
  })[] = [
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

  const validate = (answers: Answers) => {
    for (const [key, value] of Object.entries(answers)) {
      if (value == null) {
        continue;
      }

      const question = questions.find((q) => q.name === key);

      if (question == null) {
        continue;
      }

      let valid = question.validate ? question.validate(String(value)) : true;

      // We also need to guard against invalid choices
      // If we don't already have a validation message to provide a better error
      if (typeof valid !== 'string' && 'choices' in question) {
        const choices =
          typeof question.choices === 'function'
            ? question.choices(
                undefined,
                // @ts-expect-error: it complains about optional values, but it should be fine
                answers,
                question
              )
            : question.choices;

        if (choices && !choices.some((choice) => choice.value === value)) {
          valid = `Supported values are - ${choices.map((c) =>
            kleur.green(c.value)
          )}`;
        }
      }

      if (valid !== true) {
        let message = `Invalid value ${kleur.red(
          String(value)
        )} passed for ${kleur.blue(key)}`;

        if (typeof valid === 'string') {
          message += `: ${valid}`;
        }

        console.log(message);

        process.exit(1);
      }
    }
  };

  // Validate arguments passed to the CLI
  validate(argv);

  const answers = {
    ...argv,
    local,
    ...(await prompts(
      questions
        .filter((question) => {
          // Skip questions which are passed as parameter and pass validation
          if (
            argv[question.name] != null &&
            question.validate?.(argv[question.name]) !== false
          ) {
            return false;
          }

          // Skip questions with a single choice
          if (
            Array.isArray(question.choices) &&
            question.choices.length === 1
          ) {
            return false;
          }

          return true;
        })
        .map((question) => {
          const { type, choices } = question;

          // Skip dynamic questions with a single choice
          if (type === 'select' && typeof choices === 'function') {
            return {
              ...question,
              type: (prev, values, prompt) => {
                const result = choices(prev, { ...argv, ...values }, prompt);

                if (result && result.length === 1) {
                  return null;
                }

                return type;
              },
            };
          }

          return question;
        })
    )),
  } as Answers;

  validate(answers);

  const {
    slug,
    description,
    authorName,
    authorEmail,
    authorUrl,
    repoUrl,
    type = 'module-mixed',
    languages = type === 'library' ? 'js' : 'kotlin-objc',
    example = local ? 'none' : type === 'library' ? 'expo' : 'test-app',
    reactNativeVersion,
  } = answers;

  // Get latest version of Bob from NPM
  let bobVersion: string;

  try {
    bobVersion = await Promise.race([
      new Promise<string>((resolve) => {
        setTimeout(() => resolve(FALLBACK_BOB_VERSION), 1000);
      }),
      bobVersionPromise,
    ]);
  } catch (e) {
    // Fallback to a known version if we couldn't fetch
    bobVersion = FALLBACK_BOB_VERSION;
  }

  const moduleType = type.startsWith('view-') ? 'view' : 'module';
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

  const options = {
    bob: {
      version: bobVersion || FALLBACK_BOB_VERSION,
    },
    project: {
      slug,
      description,
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
      view: moduleType === 'view',
      module: moduleType === 'module',
    },
    author: {
      name: authorName,
      email: authorEmail,
      url: authorUrl,
    },
    repo: repoUrl,
    example,
    year: new Date().getFullYear(),
  };

  const copyDir = async (source: string, dest: string) => {
    await fs.mkdirp(dest);

    const files = await fs.readdir(source);

    for (const f of files) {
      const target = path.join(
        dest,
        ejs.render(f.replace(/^\$/, ''), options, {
          openDelimiter: '{',
          closeDelimiter: '}',
        })
      );

      const file = path.join(source, f);
      const stats = await fs.stat(file);

      if (stats.isDirectory()) {
        await copyDir(file, target);
      } else if (!BINARIES.some((r) => r.test(file))) {
        const content = await fs.readFile(file, 'utf8');

        await fs.writeFile(target, ejs.render(content, options));
      } else {
        await fs.copyFile(file, target);
      }
    }
  };

  await fs.mkdirp(folder);

  if (reactNativeVersion != null) {
    if (example === 'vanilla') {
      console.log(
        `${kleur.blue('ℹ')} Using ${kleur.cyan(
          `react-native@${reactNativeVersion}`
        )} for the example`
      );
    } else {
      console.warn(
        `${kleur.yellow(
          '⚠'
        )} Ignoring --react-native-version for unsupported example type: ${kleur.cyan(
          example
        )}`
      );
    }
  }

  const spinner = ora().start();

  if (example !== 'none') {
    spinner.text = 'Generating example app';

    await generateExampleApp({
      type: example,
      dest: folder,
      arch,
      project: options.project,
      bobVersion,
      reactNativeVersion,
    });
  }

  spinner.text = 'Copying files';

  if (local) {
    await copyDir(COMMON_LOCAL_FILES, folder);
  } else {
    await copyDir(COMMON_FILES, folder);

    if (example !== 'none') {
      await copyDir(COMMON_EXAMPLE_FILES, folder);
    }
  }

  if (languages === 'js') {
    await copyDir(JS_FILES, folder);
    await copyDir(EXPO_FILES, folder);
  } else {
    await copyDir(NATIVE_COMMON_FILES, folder);

    if (example !== 'none') {
      await copyDir(NATIVE_COMMON_EXAMPLE_FILES, folder);
    }

    if (moduleType === 'module') {
      await copyDir(NATIVE_FILES[`${moduleType}_${arch}`], folder);
    } else {
      await copyDir(NATIVE_FILES[`${moduleType}_${arch}`], folder);
    }

    if (options.project.swift) {
      await copyDir(SWIFT_FILES[`${moduleType}_legacy`], folder);
    } else {
      if (moduleType === 'module') {
        await copyDir(OBJC_FILES[`${moduleType}_common`], folder);
      } else {
        await copyDir(OBJC_FILES[`view_${arch}`], folder);
      }
    }

    const templateType = `${moduleType}_${arch}` as const;

    await copyDir(KOTLIN_FILES[templateType], folder);

    if (options.project.cpp) {
      await copyDir(CPP_FILES, folder);
      await fs.remove(path.join(folder, 'ios', `${options.project.name}.m`));
    }
  }

  const rootPackageJson = await fs.readJson(path.join(folder, 'package.json'));

  if (example !== 'none') {
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

    if (example === 'vanilla') {
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

      if (arch !== 'legacy') {
        addCodegenBuildScript(folder, options.project.name);
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
    let isInGitRepo = false;

    try {
      isInGitRepo =
        !argv.skipGit &&
        (await spawn('git', ['rev-parse', '--is-inside-work-tree'])) === 'true';
    } catch (e) {
      // Ignore error
    }

    if (!isInGitRepo) {
      try {
        await spawn('git', ['init'], { cwd: folder });
        await spawn('git', ['branch', '-M', 'main'], { cwd: folder });
        await spawn('git', ['add', '.'], { cwd: folder });
        await spawn('git', ['commit', '-m', 'chore: initial commit'], {
          cwd: folder,
        });
      } catch (e) {
        // Ignore error
      }
    }
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
        packageJson.dependencies[slug] =
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
        `- Import from ${kleur.blue(slug)} and use it in your app.`
      }

      ${kleur.yellow(`Good luck!`)}
    `)
    );
  } else {
    const platforms = {
      ...(example === 'none'
        ? {}
        : {
            ios: { name: 'iOS', colorize: kleur.cyan },
            android: { name: 'Android', colorize: kleur.green },
          }),
      ...(example === 'expo'
        ? { web: { name: 'Web', colorize: kleur.blue } }
        : null),
    };

    console.log(
      dedent(`
      ${kleur.magenta(
        `${kleur.bold('Get started')} with the project`
      )}${kleur.gray(':')}

        ${kleur.gray('$')} yarn
      ${Object.entries(platforms)
        .map(
          ([script, { name, colorize }]) => `
      ${colorize(`Run the example app on ${kleur.bold(name)}`)}${kleur.gray(
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

import path from 'path';
import fs from 'fs-extra';
import ejs from 'ejs';
import dedent from 'dedent';
import kleur from 'kleur';
import yargs from 'yargs';
import spawn from 'cross-spawn';
import ora from 'ora';
import validateNpmPackage from 'validate-npm-package-name';
import githubUsername from 'github-username';
import prompts, { type PromptObject } from './utils/prompts';
import generateExampleApp from './utils/generateExampleApp';

const FALLBACK_BOB_VERSION = '0.20.0';

const BINARIES = [
  /(gradlew|\.(jar|keystore|png|jpg|gif))$/,
  /\$\.yarn(?![a-z])/,
];

const COMMON_FILES = path.resolve(__dirname, '../templates/common');
const JS_FILES = path.resolve(__dirname, '../templates/js-library');
const EXPO_FILES = path.resolve(__dirname, '../templates/expo-library');
const CPP_FILES = path.resolve(__dirname, '../templates/cpp-library');
const EXAMPLE_FILES = path.resolve(__dirname, '../templates/example-legacy');
const NATIVE_COMMON_FILES = path.resolve(
  __dirname,
  '../templates/native-common'
);

const NATIVE_FILES = {
  module_legacy: path.resolve(__dirname, '../templates/native-library-legacy'),
  module_new: path.resolve(__dirname, '../templates/native-library-new'),
  module_mixed: path.resolve(__dirname, '../templates/native-library-mixed'),
  view_legacy: path.resolve(__dirname, '../templates/native-view-legacy'),
  view_mixed: path.resolve(__dirname, '../templates/native-view-mixed'),
  view_new: path.resolve(__dirname, '../templates/native-view-new'),
} as const;

const JAVA_FILES = {
  module_legacy: path.resolve(__dirname, '../templates/java-library-legacy'),
  module_new: path.resolve(__dirname, '../templates/java-library-new'),
  module_mixed: path.resolve(__dirname, '../templates/java-library-mixed'),
  view_legacy: path.resolve(__dirname, '../templates/java-view-legacy'),
  view_mixed: path.resolve(__dirname, '../templates/java-view-mixed'),
  view_new: path.resolve(__dirname, '../templates/java-view-new'),
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

const CPP_VIEW_FILES = {
  // view_legacy does NOT need component registration
  view_mixed: path.resolve(__dirname, '../templates/cpp-view-mixed'),
  view_new: path.resolve(__dirname, '../templates/cpp-view-new'),
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
  | 'react-native-version';

type ProjectLanguages =
  | 'java-objc'
  | 'java-swift'
  | 'kotlin-objc'
  | 'kotlin-swift'
  | 'cpp'
  | 'js';

type ProjectType =
  | 'module-legacy'
  | 'module-new'
  | 'module-mixed'
  | 'view-mixed'
  | 'view-new'
  | 'view-legacy'
  | 'library';

type Answers = {
  slug: string;
  description: string;
  authorName: string;
  authorEmail: string;
  authorUrl: string;
  repoUrl: string;
  languages: ProjectLanguages;
  type?: ProjectType;
  reactNativeVersion?: string;
};

const LANGUAGE_CHOICES: {
  title: string;
  value: ProjectLanguages;
  types: ProjectType[];
}[] = [
  {
    title: 'Java & Objective-C',
    value: 'java-objc',
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
    title: 'Java & Swift',
    value: 'java-swift',
    types: ['module-legacy', 'view-legacy'],
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
};

async function create(argv: yargs.Arguments<any>) {
  const folder = path.join(process.cwd(), argv.name);

  if (await fs.pathExists(folder)) {
    console.log(
      `A folder already exists at ${kleur.blue(
        folder
      )}! Please specify another folder name or delete the existing one.`
    );

    process.exit(1);
  }

  try {
    const child = spawn('npx', ['--help']);

    await new Promise((resolve, reject) => {
      child.once('error', reject);
      child.once('close', resolve);
    });
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
    name = spawn
      .sync('git', ['config', '--get', 'user.name'])
      .stdout.toString()
      .trim();

    email = spawn
      .sync('git', ['config', '--get', 'user.email'])
      .stdout.toString()
      .trim();
  } catch (e) {
    // Ignore error
  }

  const basename = path.basename(argv.name);

  const questions: Record<
    ArgName,
    Omit<PromptObject<keyof Answers>, 'validate'> & {
      validate?: (value: string) => boolean | string;
    }
  > = {
    'slug': {
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
    'description': {
      type: 'text',
      name: 'description',
      message: 'What is the description for the package?',
      validate: (input) => Boolean(input) || 'Cannot be empty',
    },
    'author-name': {
      type: 'text',
      name: 'authorName',
      message: 'What is the name of package author?',
      initial: name,
      validate: (input) => Boolean(input) || 'Cannot be empty',
    },
    'author-email': {
      type: 'text',
      name: 'authorEmail',
      message: 'What is the email address for the package author?',
      initial: email,
      validate: (input) =>
        /^\S+@\S+$/.test(input) || 'Must be a valid email address',
    },
    'author-url': {
      type: 'text',
      name: 'authorUrl',
      message: 'What is the URL for the package author?',
      // @ts-ignore: this is supported, but types are wrong
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
    'repo-url': {
      type: 'text',
      name: 'repoUrl',
      message: 'What is the URL for the repository?',
      // @ts-ignore: this is supported, but types are wrong
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
    'type': {
      type: 'select',
      name: 'type',
      message: 'What type of library do you want to develop?',
      choices: TYPE_CHOICES,
    },
    'languages': {
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
  };

  // Validate arguments passed to the CLI
  for (const [key, value] of Object.entries(argv)) {
    if (value == null) {
      continue;
    }

    const question = questions[key as ArgName];

    if (question == null) {
      continue;
    }

    let valid = question.validate ? question.validate(String(value)) : true;

    // We also need to guard against invalid choices
    // If we don't already have a validation message to provide a better error
    if (typeof valid !== 'string' && 'choices' in question) {
      const choices =
        typeof question.choices === 'function'
          ? question.choices(undefined, argv, question)
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

  const {
    slug,
    description,
    authorName,
    authorEmail,
    authorUrl,
    repoUrl,
    type = 'module-mixed',
    languages = type === 'library' ? 'js' : 'java-objc',
    reactNativeVersion,
  } = {
    ...argv,
    ...(await prompts(
      Object.entries(questions)
        .filter(([k, v]) => {
          // Skip questions which are passed as parameter and pass validation
          if (argv[k] != null && v.validate?.(argv[k]) !== false) {
            return false;
          }

          // Skip questions with a single choice
          if (Array.isArray(v.choices) && v.choices.length === 1) {
            return false;
          }

          return true;
        })
        .map(([, v]) => {
          const { type, choices } = v;

          // Skip dynamic questions with a single choice
          if (type === 'select' && typeof choices === 'function') {
            return {
              ...v,
              type: (prev, values, prompt) => {
                const result = choices(prev, { ...argv, ...values }, prompt);

                if (result && result.length === 1) {
                  return null;
                }

                return type;
              },
            };
          }

          return v;
        })
    )),
  } as Answers;

  // Get latest version of Bob from NPM
  let version: string;

  try {
    version = await Promise.race([
      new Promise<string>((resolve) =>
        setTimeout(() => resolve(FALLBACK_BOB_VERSION), 1000)
      ),
      new Promise<string>((resolve, reject) => {
        const npm = spawn('npm', [
          'view',
          'react-native-builder-bob',
          'dist-tags.latest',
        ]);

        npm.stdout?.on('data', (data) => resolve(data.toString().trim()));
        npm.stderr?.on('data', (data) => reject(data.toString().trim()));

        npm.on('error', (err) => reject(err));
      }),
    ]);
  } catch (e) {
    // Fallback to a known version if we couldn't fetch
    version = FALLBACK_BOB_VERSION;
  }

  const moduleType = type.startsWith('view-') ? 'view' : 'module';
  const arch =
    type === 'module-new' || type === 'view-new'
      ? 'new'
      : type === 'module-mixed' || type === 'view-mixed'
      ? 'mixed'
      : 'legacy';

  const example = type === 'library' ? 'expo' : 'native';
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
      version: version || FALLBACK_BOB_VERSION,
    },
    project: {
      slug,
      description,
      name:
        /^[A-Z]/.test(argv.name) && /^[a-z0-9]+$/i.test(argv.name)
          ? // If the project name is already in PascalCase, use it as-is
            argv.name
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
      kotlin: languages === 'kotlin-objc' || languages === 'kotlin-swift',
      swift: languages === 'java-swift' || languages === 'kotlin-swift',
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
    if (example === 'expo') {
      console.warn(
        `${kleur.yellow('⚠')} Ignoring --react-native-version for Expo example`
      );
    } else {
      console.log(
        `${kleur.blue('ℹ')} Using ${kleur.cyan(
          `react-native@${reactNativeVersion}`
        )} for the example`
      );
    }
  }

  const spinner = ora('Generating example').start();

  await generateExampleApp({
    type: example,
    dest: folder,
    slug: options.project.slug,
    projectName: options.project.name,
    arch,
    reactNativeVersion,
  });

  spinner.text = 'Copying files';

  await copyDir(COMMON_FILES, folder);

  if (languages === 'js') {
    await copyDir(JS_FILES, folder);
    await copyDir(EXPO_FILES, folder);
  } else {
    await copyDir(
      path.join(EXAMPLE_FILES, 'example'),
      path.join(folder, 'example')
    );

    await copyDir(NATIVE_COMMON_FILES, folder);

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

    if (options.project.kotlin) {
      await copyDir(KOTLIN_FILES[templateType], folder);
    } else {
      await copyDir(JAVA_FILES[templateType], folder);
    }

    if (options.project.cpp) {
      await copyDir(CPP_FILES, folder);
      await fs.remove(path.join(folder, 'ios', `${options.project.name}.m`));
    }

    if (moduleType === 'view') {
      if (arch === 'new' || arch === 'mixed') {
        await copyDir(CPP_VIEW_FILES[`${moduleType}_${arch}`], folder);
      }
    }
  }

  // Set `react` and `react-native` versions of root `package.json` from example `package.json`
  const examplePackageJson = fs.readJSONSync(
    path.join(folder, 'example', 'package.json')
  );
  const rootPackageJson = fs.readJSONSync(path.join(folder, 'package.json'));
  rootPackageJson.devDependencies.react = examplePackageJson.dependencies.react;
  rootPackageJson.devDependencies['react-native'] =
    examplePackageJson.dependencies['react-native'];

  fs.writeJSONSync(path.join(folder, 'package.json'), rootPackageJson, {
    spaces: 2,
  });

  try {
    spawn.sync('git', ['init'], { cwd: folder });
    spawn.sync('git', ['branch', '-M', 'main'], { cwd: folder });
    spawn.sync('git', ['add', '.'], { cwd: folder });
    spawn.sync('git', ['commit', '-m', 'chore: initial commit'], {
      cwd: folder,
    });
  } catch (e) {
    // Ignore error
  }

  spinner.succeed(
    `Project created successfully at ${kleur.yellow(argv.name)}!\n`
  );

  const platforms = {
    ios: { name: 'iOS', color: 'cyan' },
    android: { name: 'Android', color: 'green' },
    ...(example === 'expo'
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
// eslint-disable-next-line babel/no-unused-expressions
yargs
  .command('$0 <name>', 'create a react native library', args, create)
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
  .strict().argv;

import path from 'path';
import fs from 'fs-extra';
import ejs from 'ejs';
import dedent from 'dedent';
import chalk from 'chalk';
import yargs from 'yargs';
import spawn from 'cross-spawn';
import validateNpmPackage from 'validate-npm-package-name';
import githubUsername from 'github-username';
import prompts, { PromptObject } from './utils/prompts';

const FALLBACK_BOB_VERSION = '0.18.0';

const BINARIES = /(gradlew|\.(jar|keystore|png|jpg|gif))$/;

const COMMON_FILES = path.resolve(__dirname, '../templates/common');
const JS_FILES = path.resolve(__dirname, '../templates/js-library');
const EXPO_FILES = path.resolve(__dirname, '../templates/expo-library');
const CPP_FILES = path.resolve(__dirname, '../templates/cpp-library');
const EXAMPLE_FILES = path.resolve(__dirname, '../templates/example');
const NATIVE_COMMON_FILES = path.resolve(
  __dirname,
  '../templates/native-common'
);

const NATIVE_FILES = {
  module: path.resolve(__dirname, '../templates/native-library'),
  view: path.resolve(__dirname, '../templates/native-view-library'),
};

const JAVA_FILES = {
  module: path.resolve(__dirname, '../templates/java-library'),
  view: path.resolve(__dirname, '../templates/java-view-library'),
};

const OBJC_FILES = {
  module: path.resolve(__dirname, '../templates/objc-library'),
  view: path.resolve(__dirname, '../templates/objc-view-library'),
};

const KOTLIN_FILES = {
  module: path.resolve(__dirname, '../templates/kotlin-library'),
  view: path.resolve(__dirname, '../templates/kotlin-view-library'),
};

const SWIFT_FILES = {
  module: path.resolve(__dirname, '../templates/swift-library'),
  view: path.resolve(__dirname, '../templates/swift-view-library'),
};

type ArgName =
  | 'slug'
  | 'description'
  | 'author-name'
  | 'author-email'
  | 'author-url'
  | 'repo-url'
  | 'languages'
  | 'type'
  | 'example';

type Answers = {
  slug: string;
  description: string;
  authorName: string;
  authorEmail: string;
  authorUrl: string;
  repoUrl: string;
  languages:
    | 'java-objc'
    | 'java-swift'
    | 'kotlin-objc'
    | 'kotlin-swift'
    | 'cpp'
    | 'js';
  type?: 'module' | 'view';
  example?: 'expo' | 'native';
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
    choices: [
      'java-objc',
      'java-swift',
      'kotlin-objc',
      'kotlin-swift',
      'cpp',
      'js',
    ],
  },
  'type': {
    description: 'Type of library you want to develop',
    choices: ['module', 'view'],
  },
  'example': {
    description: 'Type of example app',
    choices: ['expo', 'native'],
  },
};

async function create(argv: yargs.Arguments<any>) {
  const folder = path.join(process.cwd(), argv.name);

  if (await fs.pathExists(folder)) {
    console.log(
      `A folder already exists at ${chalk.blue(
        folder
      )}! Please specify another folder name or delete the existing one.`
    );

    process.exit(1);
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
    'languages': {
      type: 'select',
      name: 'languages',
      message: 'Which languages do you want to use?',
      choices: [
        { title: 'Java & Objective-C', value: 'java-objc' },
        { title: 'Java & Swift', value: 'java-swift' },
        { title: 'Kotlin & Objective-C', value: 'kotlin-objc' },
        { title: 'Kotlin & Swift', value: 'kotlin-swift' },
        { title: 'C++ for both iOS & Android', value: 'cpp' },
        { title: 'JavaScript only', value: 'js' },
      ],
    },
    'type': {
      type: (prev: string) =>
        ['java-objc', 'java-swift', 'kotlin-objc', 'kotlin-swift'].includes(
          prev
        )
          ? 'select'
          : null,
      name: 'type',
      message: 'What type of library do you want to develop?',
      choices: [
        { title: 'Native module (to expose native APIs)', value: 'module' },
        { title: 'Native view (to use as a component)', value: 'view' },
      ],
    },
    'example': {
      type: (prev: string) => (prev === 'js' ? 'select' : null),
      name: 'example',
      message: 'What type of example app do you want to generate?',
      choices: [
        { title: 'JavaScript only (with Expo and Web support)', value: 'expo' },
        {
          title: 'Native (to use other libraries with native code)',
          value: 'native',
        },
      ],
    },
  };

  const {
    slug,
    description,
    authorName,
    authorEmail,
    authorUrl,
    repoUrl,
    languages,
    type = 'module',
    example = 'native',
  } = {
    ...argv,
    ...(await prompts(
      Object.entries(questions)
        .filter(
          ([k, v]) =>
            !(argv[k] && v.validate
              ? v.validate(argv[k]) === true
              : Boolean(argv[k]))
        )
        .map(([, v]) => v)
    )),
  } as Answers;

  const project = slug.replace(/^(react-native-|@[^/]+\/)/, '');

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

  const options = {
    bob: {
      version: version || FALLBACK_BOB_VERSION,
    },
    project: {
      slug,
      description,
      name: `${project.charAt(0).toUpperCase()}${project
        .replace(/[^a-z0-9](\w)/g, (_, $1) => $1.toUpperCase())
        .slice(1)}`,
      package: slug.replace(/[^a-z0-9]/g, '').toLowerCase(),
      identifier: slug.replace(/[^a-z0-9]+/g, '-').replace(/^-/, ''),
      native: languages !== 'js',
      cpp: languages === 'cpp',
      kotlin: languages === 'kotlin-objc' || languages === 'kotlin-swift',
      swift: languages === 'java-swift' || languages === 'kotlin-swift',
      module: languages !== 'js',
      moduleType: type,
    },
    author: {
      name: authorName,
      email: authorEmail,
      url: authorUrl,
    },
    repo: repoUrl,
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
      } else if (!file.match(BINARIES)) {
        const content = await fs.readFile(file, 'utf8');

        await fs.writeFile(target, ejs.render(content, options));
      } else {
        await fs.copyFile(file, target);
      }
    }
  };

  await copyDir(COMMON_FILES, folder);

  if (languages === 'js') {
    await copyDir(JS_FILES, folder);

    if (example === 'expo') {
      await copyDir(EXPO_FILES, folder);
    } else {
      await copyDir(
        path.join(EXAMPLE_FILES, 'example'),
        path.join(folder, 'example')
      );
    }
  } else {
    await copyDir(
      path.join(EXAMPLE_FILES, 'example'),
      path.join(folder, 'example')
    );

    await copyDir(NATIVE_COMMON_FILES, folder);
    await copyDir(NATIVE_FILES[type], folder);

    if (options.project.swift) {
      await copyDir(SWIFT_FILES[type], folder);
    } else {
      await copyDir(OBJC_FILES[type], folder);
    }

    if (options.project.kotlin) {
      await copyDir(KOTLIN_FILES[type], folder);
    } else {
      await copyDir(JAVA_FILES[type], folder);
    }

    if (options.project.cpp) {
      await copyDir(CPP_FILES, folder);
      await fs.remove(path.join(folder, 'ios', `${options.project.name}.m`));
    }
  }

  try {
    spawn.sync('git', ['init'], { cwd: folder });
    spawn.sync('git', ['add', '.'], { cwd: folder });
    spawn.sync('git', ['commit', '-m', 'chore: initial commit'], {
      cwd: folder,
    });
  } catch (e) {
    // Ignore error
  }

  const platforms: Record<string, { name: string; color: string }> = {
    ios: { name: 'iOS', color: 'cyan' },
    android: { name: 'Android', color: 'green' },
    ...(example === 'expo' ? { web: { name: 'Web', color: 'blue' } } : null),
  };

  console.log(
    dedent(chalk`
      Project created successfully at {yellow ${argv.name}}!

      {magenta {bold Get started} with the project}{gray :}

        {gray $} yarn
      ${Object.entries(platforms)
        .map(
          ([script, { name, color }]) => chalk`
      {${color} Run the example app on {bold ${name}}}{gray :}

        {gray $} yarn example ${script}`
        )
        .join('\n')}

      {yellow Good luck!}
    `)
  );
}
// eslint-disable-next-line babel/no-unused-expressions
yargs
  .command('$0 <name>', 'create a react native library', args, create)
  .demandCommand()
  .recommendCommands()
  .strict().argv;

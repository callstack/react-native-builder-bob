import path from 'path';
import fs from 'fs-extra';
import ejs from 'ejs';
import dedent from 'dedent';
import chalk from 'chalk';
import inquirer from 'inquirer';
import yargs from 'yargs';
import spawn from 'cross-spawn';
import validateNpmPackage from 'validate-npm-package-name';
import githubUsername from 'github-username';
import pack from '../package.json';

const BINARIES = /(gradlew|\.(jar|keystore|png|jpg|gif))$/;

const COMMON_FILES = path.resolve(__dirname, '../templates/common');
const NATIVE_FILES = path.resolve(__dirname, '../templates/native-library');
const EXPO_FILES = path.resolve(__dirname, '../templates/expo-library');
const CPP_FILES = path.resolve(__dirname, '../templates/cpp-library');
const OBJC_FILES = path.resolve(__dirname, '../templates/objc-library');
const SWIFT_FILES = path.resolve(__dirname, '../templates/swift-library');

type ArgName =
  | 'slug'
  | 'description'
  | 'author-name'
  | 'author-email'
  | 'author-url'
  | 'repo-url'
  | 'type';

type Answers = {
  slug: string;
  description: string;
  authorName: string;
  authorEmail: string;
  authorUrl: string;
  repoUrl: string;
  type: 'native' | 'native-swift' | 'js' | 'cpp' | 'expo';
};

export const args: Record<ArgName, yargs.Options> = {
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
  'type': {
    description: 'Type package do you want to develop',
    choices: ['native', 'native-swift', 'js', 'cpp', 'expo'],
  },
};

export default async function create(argv: yargs.Arguments<any>) {
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

  const questions: Record<ArgName, inquirer.Question> = {
    'slug': {
      type: 'input',
      message: 'What is the name of the npm package?',
      default: validateNpmPackage(basename).validForNewPackages
        ? /^(@|react-native)/.test(basename)
          ? basename
          : `react-native-${basename}`
        : undefined,
      validate: (input) =>
        validateNpmPackage(input).validForNewPackages ||
        'Must be a valid npm package name',
    },
    'description': {
      type: 'input',
      message: 'What is the description for the package?',
      validate: (input) => Boolean(input),
    },
    'author-name': {
      type: 'input',
      message: 'What is the name of package author?',
      default: name,
      validate: (input) => Boolean(input),
    },
    'author-email': {
      type: 'input',
      message: 'What is the email address for the package author?',
      default: email,
      validate: (input) =>
        /^\S+@\S+$/.test(input) || 'Must be a valid email address',
    },
    'author-url': {
      type: 'input',
      message: 'What is the URL for the package author?',
      default: async (answers: any) => {
        try {
          const username = await githubUsername(answers.authorEmail);

          return `https://github.com/${username}`;
        } catch (e) {
          // Ignore error
        }

        return undefined;
      },
      validate: (input) => /^https?:\/\//.test(input) || 'Must be a valid URL',
    },
    'repo-url': {
      type: 'input',
      message: 'What is the URL for the repository?',
      default: (answers: any) => {
        if (/^https?:\/\/github.com\/[^/]+/.test(answers.authorUrl)) {
          return `${answers.authorUrl}/${answers.slug
            .replace(/^@/, '')
            .replace(/\//g, '-')}`;
        }

        return undefined;
      },
      validate: (input) => /^https?:\/\//.test(input) || 'Must be a valid URL',
    },
    'type': {
      type: 'list',
      message: 'What type of package do you want to develop?',
      // @ts-ignore - seems types are wrong for inquirer
      choices: [
        { name: 'Native module in Kotlin and Objective-C', value: 'native' },
        { name: 'Native module in Kotlin and Swift', value: 'native-swift' },
        { name: 'Native module with C++ code', value: 'cpp' },
        {
          name: 'JavaScript module with Web support using Expo',
          value: 'expo',
        },
        {
          name: 'JavaScript module',
          value: 'js',
        },
      ],
      default: 'native',
    },
  };

  const {
    slug,
    description,
    authorName,
    authorEmail,
    authorUrl,
    repoUrl,
    type,
  } = {
    ...argv,
    ...(await inquirer.prompt(
      Object.entries(questions).map(([key, value]) => ({
        ...value,
        name: key.replace(/\b-([a-z])/g, (_, char) => char.toUpperCase()),
        when: !(argv[key] && value.validate
          ? value.validate(argv[key]) === true
          : Boolean(argv[key])),
        default:
          typeof value.default === 'function'
            ? (answers: Partial<Answers>) =>
                value.default({ ...argv, ...answers })
            : value.default,
      }))
    )),
  } as Answers;

  const project = slug.replace(/^(react-native-|@[^/]+\/)/, '');

  const options = {
    bob: {
      version: pack.version,
    },
    project: {
      slug,
      description,
      name: `${project
        .charAt(0)
        .toUpperCase()}${project
        .replace(/[^a-z0-9](\w)/g, (_, $1) => $1.toUpperCase())
        .slice(1)}`,
      package: slug.replace(/[^a-z0-9]/g, '').toLowerCase(),
      podspec: slug.replace(/[^a-z0-9]+/g, '-').replace(/^-/, ''),
      native: type === 'native' || type === 'cpp' || 'native-swift',
      cpp: type === 'cpp',
      swift: type === 'native-swift',
      type,
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
      const target = path.join(dest, ejs.render(f.replace(/^\$/, ''), options));

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

  if (type === 'expo') {
    await copyDir(EXPO_FILES, folder);
  } else {
    await copyDir(NATIVE_FILES, folder);

    if (type === 'js') {
      await Promise.all(
        [
          `android`,
          `ios`,
          `${options.project.podspec}.podspec`,
        ].map((file) => fs.remove(path.join(folder, file)))
      );
    } else if (type === 'cpp') {
      await copyDir(CPP_FILES, folder);
    } else if (type === 'native-swift') {
      await copyDir(SWIFT_FILES, folder);
    } else {
      await copyDir(OBJC_FILES, folder);
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

  const platforms = {
    ios: { name: 'iOS', color: 'cyan' },
    android: { name: 'Android', color: 'green' },
    ...(type === 'expo' ? { web: { name: 'Web', color: 'blue' } } : null),
  };

  console.log(
    dedent(chalk`
      Project created successfully at {yellow ${argv.name}}!

      {magenta {bold Get started} with the project}{gray :}

        {gray $} yarn bootstrap
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

import child_process from 'child_process';
import path from 'path';
import fs from 'fs-extra';
import ejs from 'ejs';
import dedent from 'dedent';
import chalk from 'chalk';
import inquirer from 'inquirer';
import yargs from 'yargs';
import validateNpmPackage from 'validate-npm-package-name';
import githubUsername from 'github-username';
import pack from '../package.json';

const TEMPLATE = path.resolve(__dirname, '../templates/library');
const BINARIES = /(gradlew|\.(jar|xib|keystore|png|jpg|gif))$/;

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
    name = child_process
      .execSync('git config --get user.name')
      .toString()
      .trim();

    email = child_process
      .execSync('git config --get user.email')
      .toString()
      .trim();
  } catch (e) {
    // Ignore error
  }

  const basename = path.basename(argv.name);

  const {
    slug,
    description,
    authorName,
    authorEmail,
    authorUrl,
    githubUrl: repo,
  } = (await inquirer.prompt([
    {
      type: 'input',
      name: 'slug',
      message: 'What is the name of the npm package?',
      default: validateNpmPackage(basename).validForNewPackages
        ? /^(@|react-native)/.test(basename)
          ? basename
          : `react-native-${basename}`
        : undefined,
      validate: input =>
        validateNpmPackage(input).validForNewPackages ||
        'Must be a valid npm package name',
    },
    {
      type: 'input',
      name: 'description',
      message: 'What is the description for the package?',
      validate: input => Boolean(input),
    },
    {
      type: 'input',
      name: 'authorName',
      message: 'What is the name of package author?',
      default: name,
      validate: input => Boolean(input),
    },
    {
      type: 'input',
      name: 'authorEmail',
      message: 'What is the email address for the package author?',
      default: email,
      validate: input =>
        /^\S+@\S+$/.test(input) || 'Must be a valid email address',
    },
    {
      type: 'input',
      name: 'authorUrl',
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
      validate: input => /^https?:\/\//.test(input) || 'Must be a valid URL',
    },
    {
      type: 'input',
      name: 'githubUrl',
      message: 'What is the URL for the repository?',
      default: (answers: any) => {
        if (/^https?:\/\/github.com\/[^/]+/.test(answers.authorUrl)) {
          return `${answers.authorUrl}/${answers.slug
            .replace(/^@/, '')
            .replace(/\//g, '-')}`;
        }

        return undefined;
      },
      validate: input => /^https?:\/\//.test(input) || 'Must be a valid URL',
    },
  ])) as {
    slug: string;
    description: string;
    authorName: string;
    authorEmail: string;
    authorUrl: string;
    githubUrl: string;
  };

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
    },
    author: {
      name: authorName,
      email: authorEmail,
      url: authorUrl,
    },
    repo,
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

  await copyDir(TEMPLATE, folder);

  console.log(
    dedent(chalk`
      Project created successfully at {blue ${argv.name}}!

      {magenta {bold Get started} with the project}{gray :}

        {gray $} yarn bootstrap

      {cyan Run the example app on {bold iOS}}{gray :}

        {gray $} yarn example ios

      {green Run the example app on {bold Android}}{gray :}

        {gray $} yarn example android

      {blue Good luck!}
    `)
  );
}

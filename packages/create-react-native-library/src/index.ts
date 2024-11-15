import path from 'path';
import fs from 'fs-extra';
import dedent from 'dedent';
import kleur from 'kleur';
import yargs from 'yargs';
import ora from 'ora';
import assert from 'node:assert';
import prompts from './utils/prompts';
import generateExampleApp from './exampleApp/generateExampleApp';
import { version } from '../package.json';
import { addCodegenBuildScript } from './exampleApp/addCodegenBuildScript';
import { createInitialGitCommit } from './utils/initialCommit';
import { assertAnswers, assertNpx } from './utils/assert';
import { resolveBobVersionWithFallback } from './utils/promiseWithFallback';
import { generateTemplateConfiguration } from './config';
import { applyTemplates } from './template';
import { createQuestions, type Answers, acceptedArgs } from './input';

const FALLBACK_BOB_VERSION = '0.32.0';

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

  const basename = path.basename(folder);

  const { questions, singleChoiceAnswers } = await createQuestions({
    basename,
    local,
    argv,
  });

  assertAnswers(questions, argv);

  const promptAnswers = await prompts(questions);

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
  .command('$0 [name]', 'create a react native library', acceptedArgs, create)
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

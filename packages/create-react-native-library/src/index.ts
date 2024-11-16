import path from 'path';
import fs from 'fs-extra';
import kleur from 'kleur';
import yargs from 'yargs';
import ora from 'ora';
import prompts from './utils/prompts';
import generateExampleApp from './exampleApp/generateExampleApp';
import { addCodegenBuildScript } from './exampleApp/addCodegenBuildScript';
import { createInitialGitCommit } from './utils/initialCommit';
import { assertAnswers, assertNpx } from './utils/assert';
import { resolveBobVersionWithFallback } from './utils/promiseWithFallback';
import { generateTemplateConfiguration } from './config';
import { applyTemplates } from './template';
import { createQuestions, type Answers, acceptedArgs } from './input';
import { createMetadata } from './metadata';
import { getDependencyVersionsFromExample } from './exampleApp/dependencies';
import { printNextSteps } from './nextSteps';

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
    const { devDependencies } = await getDependencyVersionsFromExample(
      folder,
      config.example
    );

    rootPackageJson.devDependencies = rootPackageJson.devDependencies
      ? {
          ...rootPackageJson.devDependencies,
          ...devDependencies,
        }
      : devDependencies;
  }

  if (config.example === 'vanilla' && config.project.arch !== 'legacy') {
    addCodegenBuildScript(folder);
  }

  const libraryMetadata = createMetadata(answers);

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

  await printNextSteps(local, folder, config);
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

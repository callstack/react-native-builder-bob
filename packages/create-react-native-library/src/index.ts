import path from 'path';
import fs from 'fs-extra';
import kleur from 'kleur';
import yargs from 'yargs';
import ora from 'ora';
import { prompt } from './utils/prompt';
import generateExampleApp from './exampleApp/generateExampleApp';
import { addCodegenBuildScript } from './exampleApp/addCodegenBuildScript';
import { createInitialGitCommit } from './utils/initialCommit';
import { assertUserInput, assertNpxExists } from './utils/assert';
import { resolveNpmPackageVersion } from './utils/resolveNpmPackageVersion';
import { applyTemplates, generateTemplateConfiguration } from './template';
import {
  createQuestions,
  createMetadata,
  type Answers,
  acceptedArgs,
  type Args,
} from './input';
import { getDependencyVersionsFromExampleApp } from './exampleApp/dependencies';
import { printErrorHelp, printNextSteps, printUsedRNVersion } from './inform';

const FALLBACK_BOB_VERSION = '0.32.0';
const FALLBACK_NITRO_MODULES_VERSION = '0.18.0';

yargs
  .command(
    '$0 [name]',
    'create a react native library',
    acceptedArgs,
    // @ts-expect-error Some types are still incompatible
    create
  )
  .demandCommand()
  .recommendCommands()
  .fail(printErrorHelp)
  .parserConfiguration({
    // don't pass kebab-case args to handler.
    'strip-dashed': true,
  })
  .strict().argv;

async function create(_argv: yargs.Arguments<Args>) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { _, $0, ...argv } = _argv;

  // Prefetch bob version in background while asking questions
  const bobVersionPromise = resolveNpmPackageVersion(
    'react-native-builder-bob',
    FALLBACK_BOB_VERSION
  );
  const nitroModulesVersionPromise = resolveNpmPackageVersion(
    'react-native-nitro-modules',
    FALLBACK_NITRO_MODULES_VERSION
  );

  const local = await promptLocalLibrary(argv);
  const folder = await promptPath(argv, local);

  await assertNpxExists();

  const basename = path.basename(folder);

  const questions = await createQuestions({ basename, local });

  assertUserInput(questions, argv);

  const promptAnswers = await prompt(questions, argv);
  const answers: Answers = {
    ...promptAnswers,
    local,
  };

  assertUserInput(questions, answers);

  const bobVersion = await bobVersionPromise;

  const nitroModulesVersion =
    answers.type === 'nitro-module'
      ? await nitroModulesVersionPromise
      : undefined;

  const config = generateTemplateConfiguration({
    versions: {
      bob: bobVersion,
      nitroModules: nitroModulesVersion,
      // Nitro codegen's version is always the same as nitro modules version.
      nitroCodegen: nitroModulesVersion,
    },
    basename,
    answers,
  });

  await fs.mkdirp(folder);

  if (answers.reactNativeVersion != null) {
    printUsedRNVersion(answers.reactNativeVersion, config);
  }

  const spinner = ora().start();

  if (config.example !== 'none') {
    spinner.text = 'Generating example app';

    await generateExampleApp({
      destination: folder,
      reactNativeVersion: answers.reactNativeVersion,
      config,
    });
  }

  spinner.text = 'Copying files';

  await applyTemplates(answers, config, folder);

  const rootPackageJson = await fs.readJson(path.join(folder, 'package.json'));

  if (config.example !== 'none') {
    const { devDependencies } = await getDependencyVersionsFromExampleApp(
      folder,
      config
    );

    rootPackageJson.devDependencies = rootPackageJson.devDependencies
      ? {
          ...rootPackageJson.devDependencies,
          ...devDependencies,
        }
      : devDependencies;
  }

  if (
    config.example === 'vanilla' &&
    (config.project.moduleConfig === 'turbo-modules' ||
      config.project.viewConfig === 'fabric-view')
  ) {
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

async function promptLocalLibrary(argv: Args) {
  let local = false;

  if (typeof argv.local === 'boolean') {
    local = argv.local;
  } else {
    const hasPackageJson = await fs.pathExists(
      path.join(process.cwd(), 'package.json')
    );

    if (hasPackageJson) {
      // If we're under a project with package.json, ask the user if they want to create a local library
      const answers = await prompt({
        type: 'confirm',
        name: 'local',
        message: `Looks like you're under a project folder. Do you want to create a local library?`,
        initial: true,
      });

      local = answers.local;
    }
  }

  return local;
}

async function promptPath(argv: Args, local: boolean) {
  let folder: string;

  if (argv.name && !local) {
    folder = path.join(process.cwd(), argv.name);
  } else {
    const answers = await prompt({
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

  return folder;
}

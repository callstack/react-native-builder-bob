import fs from 'fs-extra';
import kleur from 'kleur';
import ora from 'ora';
import path from 'path';
import yargs from 'yargs';
import { addCodegenBuildScript } from './exampleApp/addCodegenBuildScript';
import { alignDependencyVersionsWithExampleApp } from './exampleApp/dependencies';
import generateExampleApp from './exampleApp/generateExampleApp';
import {
  printErrorHelp,
  printLocalLibNextSteps,
  printNonLocalLibNextSteps,
  printUsedRNVersion,
} from './inform';
import {
  acceptedArgs,
  createMetadata,
  createQuestions,
  type Answers,
  type Args,
} from './input';
import { applyTemplates, generateTemplateConfiguration } from './template';
import { assertNpxExists, assertUserInput } from './utils/assert';
import { createInitialGitCommit } from './utils/initialCommit';
import { prompt } from './utils/prompt';
import { resolveNpmPackageVersion } from './utils/resolveNpmPackageVersion';
import {
  addNitroDependencyToLocalLibrary,
  linkLocalLibrary,
  promptLocalLibrary,
} from './utils/local';
import { determinePackageManager } from './utils/packageManager';

const FALLBACK_BOB_VERSION = '0.40.5';
const FALLBACK_NITRO_MODULES_VERSION = '0.22.1';
const SUPPORTED_REACT_NATIVE_VERSION = '0.78.2';

// eslint-disable-next-line @typescript-eslint/no-unused-expressions
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
    reactNativeVersion:
      promptAnswers.reactNativeVersion ?? SUPPORTED_REACT_NATIVE_VERSION,
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

  if (answers.reactNativeVersion !== SUPPORTED_REACT_NATIVE_VERSION) {
    printUsedRNVersion(answers.reactNativeVersion, config);
  }

  const spinner = ora().start();

  if (config.example !== 'none') {
    spinner.text = 'Generating example app';

    await generateExampleApp({
      root: folder,
      reactNativeVersion: answers.reactNativeVersion,
      config,
    });
  }

  spinner.text = 'Copying files';

  await applyTemplates(answers, config, folder);

  const rootPackageJson = await fs.readJson(path.join(folder, 'package.json'));

  if (config.example !== 'none') {
    await alignDependencyVersionsWithExampleApp(
      rootPackageJson,
      folder,
      config
    );
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

  const printSuccessMessage = () =>
    spinner.succeed(
      `Project created successfully at ${kleur.yellow(
        path.relative(process.cwd(), folder)
      )}!\n`
    );

  if (!local) {
    await createInitialGitCommit(folder);

    printSuccessMessage();

    printNonLocalLibNextSteps(config);
    return;
  }

  const packageManager = await determinePackageManager();

  let addedNitro = false;
  if (config.project.moduleConfig === 'nitro-modules') {
    addedNitro = await addNitroDependencyToLocalLibrary(config);
  }

  const linkedLocalLibrary = await linkLocalLibrary(
    config,
    folder,
    packageManager
  );

  printSuccessMessage();

  printLocalLibNextSteps({
    config,
    packageManager,
    linkedLocalLibrary,
    addedNitro,
    folder,
  });
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
    throw new Error(
      `A folder already exists at ${kleur.blue(
        folder
      )}! Please specify another folder name or delete the existing one.`
    );
  }

  return folder;
}

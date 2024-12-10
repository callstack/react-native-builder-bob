import fs from 'fs-extra';
import kleur from 'kleur';
import ora from 'ora';
import path from 'path';
import yargs from 'yargs';
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
} from './input';
import { applyTemplates, generateTemplateConfiguration } from './template';
import { assertNpxExists } from './utils/assert';
import { createInitialGitCommit } from './utils/initialCommit';
import { prompt } from './utils/prompt';
import { resolveNpmPackageVersion } from './utils/resolveNpmPackageVersion';
import {
  addNitroDependencyToLocalLibrary,
  linkLocalLibrary,
} from './utils/local';
import { determinePackageManager } from './utils/packageManager';

const FALLBACK_BOB_VERSION = '0.40.5';
const FALLBACK_NITRO_MODULES_VERSION = '0.22.1';
const SUPPORTED_REACT_NATIVE_VERSION = '0.78.2';

type Args = Partial<Answers> & {
  name?: string;
  $0: string;
  [key: string]: unknown;
};

// eslint-disable-next-line @typescript-eslint/no-unused-expressions
yargs
  .command('$0 [name]', 'create a react native library', acceptedArgs, create)
  .demandCommand()
  .recommendCommands()
  .fail(printErrorHelp)
  .parserConfiguration({
    // don't pass kebab-case args to handler.
    'strip-dashed': true,
  })
  .strict().argv;

async function create(_argv: Args) {
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

  await assertNpxExists();

  const questions = await createQuestions(argv);

  const promptAnswers = await prompt<Answers, typeof argv>(questions, argv, {
    interactive: argv.interactive,
  });

  const answers = {
    ...promptAnswers,
    reactNativeVersion:
      promptAnswers.reactNativeVersion ?? SUPPORTED_REACT_NATIVE_VERSION,
  };

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
    basename: path.basename(answers.name ?? answers.directory),
    answers,
  });

  const folder = path.resolve(process.cwd(), answers.directory);

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
    await alignDependencyVersionsWithExampleApp(rootPackageJson, folder);
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

  if (answers.local) {
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
  } else {
    await createInitialGitCommit(folder);

    printSuccessMessage();

    printNonLocalLibNextSteps(config);
  }
}

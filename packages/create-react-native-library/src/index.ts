import pak from '../package.json';
import fs from 'fs-extra';
import kleur from 'kleur';
import ora from 'ora';
import path from 'path';
import {
  FALLBACK_BOB_VERSION,
  FALLBACK_NITRO_MODULES_VERSION,
  SUPPORTED_REACT_NATIVE_VERSION,
} from './constants';
import { alignDependencyVersionsWithExampleApp } from './exampleApp/dependencies';
import generateExampleApp from './exampleApp/generateExampleApp';
import {
  printLocalLibNextSteps,
  printNonLocalLibNextSteps,
  printUsedRNVersion,
} from './inform';
import { prompt } from './prompt';
import { applyTemplates, generateTemplateConfiguration } from './template';
import { assertNpxExists } from './utils/assert';
import { configureTools } from './utils/configureTools';
import { createInitialGitCommit } from './utils/initialCommit';
import {
  addNitroDependencyToLocalLibrary,
  linkLocalLibrary,
} from './utils/local';
import { determinePackageManager } from './utils/packageManager';
import { resolveNpmPackageVersion } from './utils/resolveNpmPackageVersion';
import { createMetadata } from './utils/createMetadata';

async function create() {
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

  const answers = await prompt.show({
    name: pak.name,
    version: pak.version,
    description: pak.description,
  });

  if (answers == null) {
    process.exit(0);
  }

  console.log(''); // Empty new line after prompts

  const bobVersion = await bobVersionPromise;
  const nitroModulesVersion =
    answers.type === 'nitro-module' || answers.type === 'nitro-view'
      ? await nitroModulesVersionPromise
      : undefined;

  const config = generateTemplateConfiguration({
    versions: {
      bob: bobVersion,
      nitro: nitroModulesVersion,
    },
    basename: path.basename(answers.name ?? answers.directory),
    answers,
  });

  const folder = path.resolve(process.cwd(), answers.directory);

  await fs.mkdirp(folder);

  if (
    answers.reactNativeVersion != null &&
    answers.reactNativeVersion !== SUPPORTED_REACT_NATIVE_VERSION
  ) {
    printUsedRNVersion(answers.reactNativeVersion, config);
  }

  const spinner = ora().start();

  if (config.example != null) {
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

  if (config.example != null) {
    await alignDependencyVersionsWithExampleApp(rootPackageJson, folder);
  }

  if (!answers.local) {
    spinner.text = 'Configuring tools';

    await configureTools({
      tools: answers.tools,
      config,
      root: folder,
      packageJson: rootPackageJson,
    });
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
    spinner.text = 'Initializing git repository';

    try {
      const abortController = new AbortController();

      // Creating git repository can get stuck in some cases,
      // e.g. if git asks for ssh passphrase.
      // We abort it after a timeout so that this doesn't hang forever.
      await Promise.race([
        createInitialGitCommit(folder, abortController.signal),
        new Promise<void>((_resolve, reject) => {
          setTimeout(() => {
            const error = new Error('Creating git repository took too long');

            abortController.abort(error.message);
            reject(error);
          }, 5000);
        }),
      ]);
    } catch (error) {
      spinner.warn('Failed to create git repository');
    }

    printSuccessMessage();

    printNonLocalLibNextSteps(config);
  }
}

create().catch((e: unknown) => {
  console.log('\n');
  console.log(kleur.red('× An error occurred while creating the project.\n'));
  console.error(e);

  process.exit(1);
});

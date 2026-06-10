import path from 'node:path';
import fs from 'fs-extra';
import kleur from 'kleur';
import ora from 'ora';
import pak from '../package.json' with { type: 'json' };
import {
  FALLBACK_BOB_VERSION,
  FALLBACK_NITRO_MODULES_VERSION,
} from './constants.ts';
import { alignDependencyVersionsWithExampleApp } from './exampleApp/dependencies.ts';
import generateExampleApp from './exampleApp/generateExampleApp.ts';
import { printLocalLibNextSteps, printNonLocalLibNextSteps } from './inform.ts';
import { prompt } from './prompt.ts';
import { applyTemplates, generateTemplateConfiguration } from './template.ts';
import { assertNpxExists } from './utils/assert.ts';
import { configureTools } from './utils/configureTools.ts';
import { createMetadata } from './utils/createMetadata.ts';
import { createInitialGitCommit } from './utils/initialCommit.ts';
import {
  addNitroDependencyToLocalLibrary,
  linkLocalLibrary,
} from './utils/local.ts';
import { determinePackageManager } from './utils/packageManager.ts';
import { resolveNpmPackageVersion } from './utils/resolveNpmPackageVersion.ts';

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

  if (answers.directory == null) {
    throw new Error('Missing required option: --directory');
  }

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

  const spinner = ora().start();

  if (config.example != null) {
    spinner.text = 'Generating example app';

    await generateExampleApp({
      root: folder,
      reactNativeVersion: answers.reactNativeVersion,
      config,
    });
  } else {
    if (answers.reactNativeVersion) {
      console.warn(
        `${kleur.yellow(
          '⚠'
        )} Ignoring --react-native-version for library without example app`
      );
    }
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
      tools: config.tools,
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

    let timer;

    try {
      const abortController = new AbortController();

      // Creating git repository can get stuck in some cases,
      // e.g. if git asks for ssh passphrase.
      // We abort it after a timeout so that this doesn't hang forever.
      await Promise.race([
        createInitialGitCommit(folder, abortController.signal),
        new Promise<void>((_resolve, reject) => {
          timer = setTimeout(() => {
            const error = new Error('Creating git repository took too long');

            abortController.abort(error.message);
            reject(error);
          }, 5000);
        }),
      ]);
    } catch (error) {
      spinner.warn('Failed to create git repository');
    } finally {
      // The process waits for the timer if we don't clear it here
      clearTimeout(timer);
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

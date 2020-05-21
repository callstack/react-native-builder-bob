import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';
import yargs from 'yargs';
import inquirer from 'inquirer';
import { cosmiconfigSync } from 'cosmiconfig';
import isGitDirty from 'is-git-dirty';
import create, { args as CreateArgs } from './create';
import * as logger from './utils/logger';
import buildAAR from './targets/aar';
import buildCommonJS from './targets/commonjs';
import buildModule from './targets/module';
import buildTypescript from './targets/typescript';
import { Options } from './types';

// eslint-disable-next-line import/no-commonjs
const { name } = require('../package.json');

const root = process.cwd();
const explorer = cosmiconfigSync(name, {
  searchPlaces: ['package.json', `bob.config.js`],
});

const FLOW_PRGAMA_REGEX = /\*?\s*@(flow)\b/m;

// eslint-disable-next-line babel/no-unused-expressions
yargs
  .command('create <name>', 'create a react native library', CreateArgs, create)
  .command('init', 'configure the package to use bob', {}, async () => {
    const pak = path.join(root, 'package.json');

    if (isGitDirty()) {
      const { shouldContinue } = await inquirer.prompt({
        type: 'confirm',
        name: 'shouldContinue',
        message: `The working directory is not clean. You should commit or stash your changes before configuring bob. Continue anyway?`,
        default: false,
      });

      if (!shouldContinue) {
        process.exit(1);
      }
    }

    if (!(await fs.pathExists(pak))) {
      logger.exit(
        `Couldn't find a 'package.json' file in '${root}'. Are you in a project folder?`
      );
    }

    const { source } = await inquirer.prompt({
      type: 'input',
      name: 'source',
      message: 'Where are your source files?',
      default: 'src',
      validate: (input) => Boolean(input),
    });

    let entryFile;

    if (await fs.pathExists(path.join(root, source, 'index.js'))) {
      entryFile = 'index.js';
    } else if (await fs.pathExists(path.join(root, source, 'index.ts'))) {
      entryFile = 'index.ts';
    } else if (await fs.pathExists(path.join(root, source, 'index.tsx'))) {
      entryFile = 'index.tsx';
    }

    if (!entryFile) {
      logger.exit(
        `Couldn't find a 'index.js'. 'index.ts' or 'index.tsx' file under '${source}'. Please re-run the CLI after creating it.`
      );
      return;
    }

    const pkg = JSON.parse(await fs.readFile(pak, 'utf-8'));
    const questions: inquirer.Question[] = [
      {
        type: 'input',
        name: 'output',
        message: 'Where do you want to generate the output files?',
        default: 'lib',
        validate: (input) => Boolean(input),
      },
      {
        type: 'checkbox',
        name: 'targets',
        message: 'Which targets do you want to build?',
        // @ts-ignore
        choices: ['aar', 'commonjs', 'module', 'typescript'],
        validate: (input) => Boolean(input.length),
      },
    ];

    if (
      entryFile.endsWith('.js') &&
      FLOW_PRGAMA_REGEX.test(
        await fs.readFile(path.join(root, source, entryFile), 'utf-8')
      )
    ) {
      questions.push({
        type: 'confirm',
        name: 'flow',
        message: 'Do you want to publish definitions for flow?',
        default: Object.keys(pkg.devDependencies || {}).includes('flow-bin'),
      });
    }

    const { output, targets, flow } = await inquirer.prompt(questions);

    const target =
      targets[0] === 'commonjs' || targets[0] === 'module'
        ? targets[0]
        : undefined;

    const entries: { [key: string]: string } = {
      'main': target
        ? path.join(output, target, 'index.js')
        : path.join(source, entryFile),
      'react-native': path.join(source, entryFile),
    };

    if (targets.includes('module')) {
      entries.module = path.join(output, 'module', 'index.js');
    }

    if (targets.includes('typescript')) {
      entries.types = path.join(output, 'typescript', source, 'index.d.ts');

      if (!(await fs.pathExists(path.join(root, 'tsconfig.json')))) {
        const { tsconfig } = await inquirer.prompt({
          type: 'confirm',
          name: 'tsconfig',
          message: `You have enabled 'typescript' compilation, but we couldn't find a 'tsconfig.json' in project root. Generate one?`,
          default: true,
        });

        if (tsconfig) {
          await fs.writeFile(
            path.join(root, 'tsconfig.json'),
            JSON.stringify(
              {
                compilerOptions: {
                  allowUnreachableCode: false,
                  allowUnusedLabels: false,
                  esModuleInterop: true,
                  forceConsistentCasingInFileNames: true,
                  jsx: 'react',
                  lib: ['esnext'],
                  module: 'esnext',
                  moduleResolution: 'node',
                  noFallthroughCasesInSwitch: true,
                  noImplicitReturns: true,
                  noImplicitUseStrict: false,
                  noStrictGenericChecks: false,
                  noUnusedLocals: true,
                  noUnusedParameters: true,
                  resolveJsonModule: true,
                  skipLibCheck: true,
                  strict: true,
                  target: 'esnext',
                },
              },
              null,
              2
            )
          );
        }
      }
    }

    const prepare = 'bob build';
    const files = [source, output, '!**/__tests__'];

    for (const key in entries) {
      const entry = entries[key];

      if (pkg[key] && pkg[key] !== entry) {
        const { replace } = await inquirer.prompt({
          type: 'confirm',
          name: 'replace',
          message: `Your package.json has the '${key}' field set to '${pkg[key]}'. Do you want to replace it with '${entry}'?`,
          default: true,
        });

        if (replace) {
          pkg[key] = entry;
        }
      } else {
        pkg[key] = entry;
      }
    }

    if (pkg.scripts && pkg.scripts.prepare && pkg.scripts.prepare !== prepare) {
      const { replace } = await inquirer.prompt({
        type: 'confirm',
        name: 'replace',
        message: `Your package.json has the 'scripts.prepare' field set to '${pkg.scripts.prepare}'. Do you want to replace it with '${prepare}'?`,
        default: true,
      });

      if (replace) {
        pkg.scripts.prepare = prepare;
      }
    } else {
      pkg.scripts = pkg.scripts || {};
      pkg.scripts.prepare = prepare;
    }

    if (
      pkg.files &&
      JSON.stringify(pkg.files.slice().sort()) !==
        JSON.stringify(files.slice().sort())
    ) {
      const { update } = await inquirer.prompt({
        type: 'confirm',
        name: 'update',
        message: `Your package.json already has a 'files' field. Do you want to update it?`,
        default: true,
      });

      if (update) {
        pkg.files = [
          ...files,
          ...pkg.files.filter(
            (file: string) => !files.includes(file.replace(/\/$/g, ''))
          ),
        ];
      }
    } else {
      pkg.files = files;
    }

    pkg[name] = {
      source,
      output,
      targets: targets.map((t: string) => {
        if (t === target && flow) {
          return [t, { flow }];
        }

        return t;
      }),
    };

    if (pkg.jest) {
      const entry = `<rootDir>/${output}/`;

      if (pkg.jest.modulePathIgnorePatterns) {
        const { modulePathIgnorePatterns } = pkg.jest;

        if (!modulePathIgnorePatterns.includes(entry)) {
          modulePathIgnorePatterns.push(entry);
        }
      } else {
        pkg.jest.modulePathIgnorePatterns = [entry];
      }
    }

    pkg.eslintIgnore = pkg.eslintIgnore || ['node_modules/'];

    if (!pkg.eslintIgnore.includes(`${output}/`)) {
      pkg.eslintIgnore.push(`${output}/`);
    }

    await fs.writeFile(pak, JSON.stringify(pkg, null, 2));

    const ignorefiles = [
      path.join(root, '.gitignore'),
      path.join(root, '.eslintignore'),
    ];

    for (const ignorefile of ignorefiles) {
      if (await fs.pathExists(ignorefile)) {
        const content = await fs.readFile(ignorefile, 'utf-8');

        if (!content.split('\n').includes(`${output}/`)) {
          await fs.writeFile(
            ignorefile,
            `${content}\n# generated by bob\n${output}/\n`
          );
        }
      }
    }

    logger.success('Your project is configured!');
  })
  .command('build', 'build files for publishing', {}, async (argv) => {
    const result = explorer.search();

    if (!result?.config) {
      logger.exit(
        `No configuration found. Run '${argv.$0} init' to create one automatically.`
      );
    }

    const options: Options = result!.config;

    if (!(options.targets && options.targets.length)) {
      logger.exit(
        `No targets found in the configuration in '${path.relative(
          root,
          result!.filepath
        )}'.`
      );
    }

    const source = options.source;

    if (!source) {
      logger.exit(
        `No source option found in the configuration in '${path.relative(
          root,
          result!.filepath
        )}'.`
      );
    }

    const output = options.output;

    if (!output) {
      logger.exit(
        `No source option found in the configuration in '${path.relative(
          root,
          result!.filepath
        )}'.`
      );
    }

    const report = {
      info: logger.info,
      warn: logger.warn,
      error: logger.error,
      success: logger.success,
    };

    for (const target of options.targets!) {
      const targetName = Array.isArray(target) ? target[0] : target;
      const targetOptions = Array.isArray(target) ? target[1] : undefined;

      report.info(`Building target ${chalk.blue(targetName)}`);

      switch (targetName) {
        case 'aar':
          await buildAAR({
            root,
            source: path.resolve(root, source as string),
            output: path.resolve(root, output as string, 'aar'),
            options: targetOptions,
            report,
          });
          break;
        case 'commonjs':
          await buildCommonJS({
            root,
            source: path.resolve(root, source as string),
            output: path.resolve(root, output as string, 'commonjs'),
            options: targetOptions,
            report,
          });
          break;
        case 'module':
          await buildModule({
            root,
            source: path.resolve(root, source as string),
            output: path.resolve(root, output as string, 'module'),
            options: targetOptions,
            report,
          });
          break;
        case 'typescript':
          await buildTypescript({
            root,
            source: path.resolve(root, source as string),
            output: path.resolve(root, output as string, 'typescript'),
            options: targetOptions,
            report,
          });
          break;
        default:
          logger.exit(`Invalid target ${chalk.blue(targetName)}.`);
      }
    }
  })
  .demandCommand()
  .recommendCommands()
  .strict().argv;

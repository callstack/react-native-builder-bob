import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';
import dedent from 'dedent';
import yargs from 'yargs';
import isGitDirty from 'is-git-dirty';
import prompts, { PromptObject } from './utils/prompts';
import * as logger from './utils/logger';
import { build } from './build';

// eslint-disable-next-line import/no-commonjs
const { name, version } = require('../package.json');

const root = process.cwd();

const FLOW_PRGAMA_REGEX = /\*?\s*@(flow)\b/m;

// eslint-disable-next-line babel/no-unused-expressions
yargs
  .command('init', 'configure the package to use bob', {}, async () => {
    const pak = path.join(root, 'package.json');

    if (isGitDirty()) {
      const { shouldContinue } = await prompts({
        type: 'confirm',
        name: 'shouldContinue',
        message: `The working directory is not clean. You should commit or stash your changes before configuring bob. Continue anyway?`,
        initial: false,
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

    const { source } = await prompts({
      type: 'text',
      name: 'source',
      message: 'Where are your source files?',
      initial: 'src',
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

    pkg.devDependencies = Object.fromEntries(
      [
        ...Object.entries(pkg.devDependencies || {}),
        [name, `^${version}`],
      ].sort(([a], [b]) => a.localeCompare(b))
    );

    const questions: PromptObject[] = [
      {
        type: 'text',
        name: 'output',
        message: 'Where do you want to generate the output files?',
        initial: 'lib',
        validate: (input: string) => Boolean(input),
      },
      {
        type: 'multiselect',
        name: 'targets',
        message: 'Which targets do you want to build?',
        choices: [
          {
            title: 'commonjs - for running in Node (tests, SSR etc.)',
            value: 'commonjs',
            selected: true,
          },
          {
            title: 'module - for bundlers (metro, webpack etc.)',
            value: 'module',
            selected: true,
          },
          {
            title: 'typescript - declaration files for typechecking',
            value: 'typescript',
            selected: /\.tsx?$/.test(entryFile),
          },
          {
            title: 'aar - bundle android code to a binary',
            value: 'aar',
            selected: false,
          },
        ],
        validate: (input: string) => Boolean(input.length),
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
        initial: Object.keys(pkg.devDependencies || {}).includes('flow-bin'),
      });
    }

    const { output, targets, flow } = await prompts(questions);

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
        const { tsconfig } = await prompts({
          type: 'confirm',
          name: 'tsconfig',
          message: `You have enabled 'typescript' compilation, but we couldn't find a 'tsconfig.json' in project root. Generate one?`,
          initial: true,
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
    const files = [
      source,
      output,
      '!**/__tests__',
      '!**/__fixtures__',
      '!**/__mocks__',
    ];

    for (const key in entries) {
      const entry = entries[key];

      if (pkg[key] && pkg[key] !== entry) {
        const { replace } = await prompts({
          type: 'confirm',
          name: 'replace',
          message: `Your package.json has the '${key}' field set to '${pkg[key]}'. Do you want to replace it with '${entry}'?`,
          initial: true,
        });

        if (replace) {
          pkg[key] = entry;
        }
      } else {
        pkg[key] = entry;
      }
    }

    if (pkg.scripts?.prepare && pkg.scripts.prepare !== prepare) {
      const { replace } = await prompts({
        type: 'confirm',
        name: 'replace',
        message: `Your package.json has the 'scripts.prepare' field set to '${pkg.scripts.prepare}'. Do you want to replace it with '${prepare}'?`,
        initial: true,
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
      const { update } = await prompts({
        type: 'confirm',
        name: 'update',
        message: `Your package.json already has a 'files' field. Do you want to update it?`,
        initial: true,
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

    console.log(
      dedent(chalk`
      Project {yellow ${pkg.name}} configured successfully!

      {magenta {bold Perform last steps} by running}{gray :}

        {gray $} yarn

      {yellow Good luck!}
    `)
    );
  })
  .command('build', 'build files for publishing', {}, (argv) =>
    build({ argv, root })
  )
  .command('watch', 'build and watch files', {}, (argv) =>
    build({ argv, root, watch: true })
  )
  .command(
    'create <name>',
    'create a react native library (deprecated)',
    {},
    (argv) => {
      console.log(
        dedent(chalk`
        The {magenta create} command has been moved to {magenta create-react-native-library}!

        Please run:

          {gray $} npx create-react-native-library ${argv.name}

        Good luck!
      `)
      );
    }
  )
  .demandCommand()
  .recommendCommands()
  .strict().argv;

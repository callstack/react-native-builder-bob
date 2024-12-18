import path from 'path';
import fs from 'fs-extra';
import kleur from 'kleur';
import dedent from 'dedent';
import yargs from 'yargs';
import { cosmiconfig } from 'cosmiconfig';
import isGitDirty from 'is-git-dirty';
import prompts, { type PromptObject } from './utils/prompts';
import * as logger from './utils/logger';
import buildCommonJS from './targets/commonjs';
import buildModule from './targets/module';
import buildTypescript from './targets/typescript';
import buildCodegen from './targets/codegen';
import customTarget from './targets/custom';
import type { Options, Report, Target } from './types';
import runScript from './targets/script';

type ArgName = 'target';

const args = {
  target: {
    type: 'string',
    description: 'The target to build',
    choices: ['commonjs', 'module', 'typescript', 'codegen'] satisfies Target[],
  },
} satisfies Record<ArgName, yargs.Options>;

// eslint-disable-next-line import/no-commonjs, @typescript-eslint/no-var-requires
const { name, version } = require('../package.json');

const root = process.cwd();
const explorer = cosmiconfig(name, {
  stopDir: root,
  searchPlaces: [
    'package.json',
    'bob.config.mjs',
    'bob.config.cjs',
    'bob.config.js',
  ],
});

const projectPackagePath = path.resolve(root, 'package.json');

const FLOW_PRGAMA_REGEX = /\*?\s*@(flow)\b/m;

yargs
  .command('init', 'configure the package to use bob', {}, async () => {
    if (isGitDirty()) {
      const { shouldContinue } = await prompts({
        type: 'confirm',
        name: 'shouldContinue',
        message: `The working directory is not clean.\n  You should commit or stash your changes before configuring bob.\n  Continue anyway?`,
        initial: false,
      });

      if (!shouldContinue) {
        process.exit(0);
      }
    }

    if (!(await fs.pathExists(projectPackagePath))) {
      logger.exit(
        `Couldn't find a 'package.json' file in '${root}'.\n  Are you in a project folder?`
      );
    }

    const pkg = JSON.parse(await fs.readFile(projectPackagePath, 'utf-8'));
    const result = await explorer.search();

    if (result?.config && pkg.devDependencies && name in pkg.devDependencies) {
      const { shouldContinue } = await prompts({
        type: 'confirm',
        name: 'shouldContinue',
        message: `The project seems to be already configured with bob.\n  Do you want to overwrite the existing configuration?`,
        initial: false,
      });

      if (!shouldContinue) {
        process.exit(0);
      }
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
        `Couldn't find a 'index.js'. 'index.ts' or 'index.tsx' file under '${source}'.\n  Please re-run the CLI after creating it.`
      );
      return;
    }

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

    const entries: {
      [key in 'source' | 'main' | 'module' | 'types']?: string;
    } = {
      source: `./${path.join(source, entryFile)}`,
    };

    let esm = false;

    if (targets.includes('module')) {
      esm = true;

      if (targets.includes('commonjs')) {
        entries.main = `./${path.join(output, 'commonjs', 'index.js')}`;
      }

      entries.module = `./${path.join(output, 'module', 'index.js')}`;
    } else if (targets.includes('commonjs')) {
      entries.main = `./${path.join(output, 'commonjs', 'index.js')}`;
    } else {
      entries.main = entries.source;
    }

    const types: {
      [key in 'require' | 'import']?: string;
    } = {};

    if (targets.includes('typescript')) {
      types.require = `./${path.join(
        output,
        'typescript',
        'commonjs',
        source,
        'index.d.ts'
      )}`;

      types.import = `./${path.join(
        output,
        'typescript',
        'module',
        source,
        'index.d.ts'
      )}`;

      entries.types = types.require;

      if (!(await fs.pathExists(path.join(root, 'tsconfig.json')))) {
        const { tsconfig } = await prompts({
          type: 'confirm',
          name: 'tsconfig',
          message: `You have enabled 'typescript' compilation, but we couldn't find a 'tsconfig.json' in project root.\n  Generate one?`,
          initial: true,
        });

        if (tsconfig) {
          await fs.writeJSON(
            path.join(root, 'tsconfig.json'),
            {
              compilerOptions: {
                rootDir: '.',
                allowUnreachableCode: false,
                allowUnusedLabels: false,
                esModuleInterop: true,
                forceConsistentCasingInFileNames: true,
                jsx: 'react-jsx',
                lib: ['ESNext'],
                module: 'ESNext',
                moduleResolution: 'Bundler',
                noFallthroughCasesInSwitch: true,
                noImplicitReturns: true,
                noImplicitUseStrict: false,
                noStrictGenericChecks: false,
                noUncheckedIndexedAccess: true,
                noUnusedLocals: true,
                noUnusedParameters: true,
                resolveJsonModule: true,
                skipLibCheck: true,
                strict: true,
                target: 'ESNext',
                verbatimModuleSyntax: true,
              },
            },
            { spaces: 2 }
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
      const entry = entries[key as keyof typeof entries];

      if (pkg[key] && pkg[key] !== entry) {
        const { replace } = await prompts({
          type: 'confirm',
          name: 'replace',
          message: `Your package.json has the '${key}' field set to '${pkg[key]}'.\n  Do you want to replace it with '${entry}'?`,
          initial: true,
        });

        if (replace) {
          pkg[key] = entry;
        }
      } else {
        pkg[key] = entry;
      }
    }

    if (esm) {
      let replace = false;

      const exportsField = {
        '.': {
          import: {
            ...(types.import ? { types: types.import } : null),
            ...(entries.module ? { default: entries.module } : null),
          },
          require: {
            ...(types.require ? { types: types.require } : null),
            ...(entries.main ? { default: entries.main } : null),
          },
        },
      };

      if (pkg.codegenConfig && !pkg.codegenConfig.includesGeneratedCode) {
        // @ts-expect-error The exports is not strictly types therefore it doesn't know about the package.json property
        exportsField['./package.json'] = './package.json';
      }

      if (
        pkg.exports &&
        JSON.stringify(pkg.exports) !== JSON.stringify(exportsField)
      ) {
        replace = (
          await prompts({
            type: 'confirm',
            name: 'replace',
            message: `Your package.json has 'exports' field set.\n  Do you want to replace it?`,
            initial: true,
          })
        ).replace;
      } else {
        replace = true;
      }

      if (replace) {
        pkg.exports = exportsField;
      }
    }

    if (
      pkg['react-native'] &&
      (pkg['react-native'].startsWith(source) ||
        pkg['react-native'].startsWith(`./${source}`))
    ) {
      const { remove } = await prompts({
        type: 'confirm',
        name: 'remove',
        message: `Your package.json has the 'react-native' field pointing to source code.\n  This can cause problems when customizing babel configuration.\n  Do you want to remove it?`,
        initial: true,
      });

      if (remove) {
        delete pkg['react-native'];
      }
    }

    if (pkg.scripts?.prepare && pkg.scripts.prepare !== prepare) {
      const { replace } = await prompts({
        type: 'confirm',
        name: 'replace',
        message: `Your package.json has the 'scripts.prepare' field set to '${pkg.scripts.prepare}'.\n  Do you want to replace it with '${prepare}'?`,
        initial: true,
      });

      if (replace) {
        pkg.scripts.prepare = prepare;
      }
    } else {
      pkg.scripts = pkg.scripts || {};
      pkg.scripts.prepare = prepare;
    }

    if (pkg.files) {
      const pkgFiles = pkg.files;

      if (files?.some((file) => !pkgFiles.includes(file))) {
        const { update } = await prompts({
          type: 'confirm',
          name: 'update',
          message: `Your package.json already has a 'files' field.\n  Do you want to update it?`,
          initial: true,
        });

        if (update) {
          pkg.files = [
            ...files,
            ...pkg.files.filter((file: string) => !files.includes(file)),
          ];
        }
      }
    } else {
      pkg.files = files;
    }

    pkg[name] = {
      source,
      output,
      targets: targets.map((t: string) => {
        if (t === target && flow) {
          return [t, { copyFlow: true }];
        }

        if (t === 'commonjs' || t === 'module' || t === 'typescript') {
          return [t, { esm }];
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

    await fs.writeJSON(projectPackagePath, pkg, {
      spaces: 2,
    });

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

    const packageManager = (await fs.pathExists(path.join(root, 'yarn.lock')))
      ? 'yarn'
      : 'npm';

    console.log(
      dedent(`
      Project ${kleur.yellow(pkg.name)} configured successfully!

      ${kleur.magenta(
        `${kleur.bold('Perform last steps')} by running`
      )}${kleur.gray(':')}

        ${kleur.gray('$')} ${packageManager} install

      ${kleur.yellow('Good luck!')}
    `)
    );
  })
  .command('build', 'build files for publishing', args, async (argv) => {
    if (!(await fs.pathExists(projectPackagePath))) {
      throw new Error(
        `Couldn't find a 'package.json' file in '${root}'. Are you in a project folder?`
      );
    }

    const result = await explorer.search();

    if (!result?.config) {
      logger.exit(
        `No configuration found. Run '${argv.$0} init' to create one automatically.`
      );
    }

    const options: Options = result!.config;

    if (!options.targets?.length) {
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

    const exclude =
      options.exclude ?? '**/{__tests__,__fixtures__,__mocks__}/**';

    const report = {
      info: logger.info,
      warn: logger.warn,
      error: logger.error,
      success: logger.success,
    };

    if (argv.target != null) {
      buildTarget(
        argv.target,
        report,
        source as string,
        output as string,
        exclude
      );
    } else {
      for (const target of options.targets!) {
        buildTarget(
          target,
          report,
          source as string,
          output as string,
          exclude
        );
      }
    }
  })
  .demandCommand()
  .recommendCommands()
  .strict().argv;

async function buildTarget(
  target: Exclude<Options['targets'], undefined>[number],
  report: Report,
  source: string,
  output: string,
  exclude: string
) {
  const targetName = Array.isArray(target) ? target[0] : target;
  const targetOptions = Array.isArray(target) ? target[1] : undefined;

  report.info(`Building target ${kleur.blue(targetName)}`);

  switch (targetName) {
    case 'commonjs':
      await buildCommonJS({
        root,
        source: path.resolve(root, source),
        output: path.resolve(root, output, 'commonjs'),
        exclude,
        options: targetOptions,
        report,
      });
      break;
    case 'module':
      await buildModule({
        root,
        source: path.resolve(root, source),
        output: path.resolve(root, output, 'module'),
        exclude,
        options: targetOptions,
        report,
      });
      break;
    case 'typescript':
      await buildTypescript({
        root,
        source: path.resolve(root, source),
        output: path.resolve(root, output, 'typescript'),
        options: targetOptions,
        report,
      });
      break;
    case 'codegen':
      await buildCodegen({
        root,
        source: path.resolve(root, source),
        output: path.resolve(root, output, 'typescript'),
        report,
      });
      break;
    case 'custom':
      await customTarget({
        options: targetOptions,
        source: path.resolve(root, source),
        report,
        root,
      });
      break;
    default:
      logger.exit(`Invalid target ${kleur.blue(targetName)}.`);
  }
}

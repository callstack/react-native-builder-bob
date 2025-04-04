import path from 'path';
import fs from 'fs-extra';
import kleur from 'kleur';
import dedent from 'dedent';
import isGitDirty from 'is-git-dirty';
import prompts, { type PromptObject } from './utils/prompts';
import { loadConfig } from './utils/loadConfig';

// eslint-disable-next-line @typescript-eslint/no-require-imports,import-x/no-commonjs
const { name, version } = require('../package.json');

const FLOW_PRGAMA_REGEX = /\*?\s*@(flow)\b/m;

export async function init() {
  const root = process.cwd();
  const projectPackagePath = path.resolve(root, 'package.json');

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
    throw new Error(
      `Couldn't find a 'package.json' file in '${root}'.\n  Are you in a project folder?`
    );
  }

  const pkg = JSON.parse(await fs.readFile(projectPackagePath, 'utf-8'));
  const result = loadConfig(root);

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
    throw new Error(
      `Couldn't find a 'index.js'. 'index.ts' or 'index.tsx' file under '${source}'.\n  Please re-run the CLI after creating it.`
    );
  }

  pkg.devDependencies = Object.fromEntries(
    [...Object.entries(pkg.devDependencies || {}), [name, `^${version}`]].sort(
      ([a], [b]) => a.localeCompare(b)
    )
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
          title: 'module - for modern setups',
          value: 'module',
          selected: true,
        },
        {
          title: 'commonjs - for legacy setups (Node.js < 20)',
          value: 'commonjs',
          selected: false,
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
    [key in 'source' | 'commonjs' | 'module']?: string;
  } = {
    source: `./${path.join(source, entryFile)}`,
  };

  let esm = false;

  if (targets.includes('module')) {
    esm = true;
    entries.module = `./${path.join(output, 'module', 'index.js')}`;
  }

  if (targets.includes('commonjs')) {
    entries.commonjs = `./${path.join(output, 'commonjs', 'index.js')}`;
  }

  const types: {
    [key in 'require' | 'import']?: string;
  } = {};

  if (targets.includes('typescript')) {
    if (targets.includes('commonjs') && targets.includes('module')) {
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
    } else {
      types.require = `./${path.join(
        output,
        'typescript',
        source,
        'index.d.ts'
      )}`;

      types.import = types.require;
    }

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
              moduleResolution: 'bundler',
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

  if (esm) {
    let replace = false;

    const exportsField = {
      '.': {},
      './package.json': './package.json',
    };

    const importField = {
      ...(types.import ? { types: types.import } : null),
      ...(entries.module ? { default: entries.module } : null),
    };

    const requireField = {
      ...(types.require ? { types: types.require } : null),
      ...(entries.commonjs ? { default: entries.commonjs } : null),
    };

    if (targets.includes('commonjs') && targets.includes('module')) {
      exportsField['.'] = {
        import: importField,
        require: requireField,
      };
    } else if (targets.includes('commonjs')) {
      exportsField['.'] = requireField;
    } else if (targets.includes('module')) {
      exportsField['.'] = importField;
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

  const entryFields: {
    [key in 'source' | 'main' | 'module' | 'types']?: string;
  } = {
    source: entries.source,
  };

  if (targets.includes('commonjs') && targets.includes('module')) {
    entryFields.main = entries.commonjs;
    entryFields.module = entries.module;
  } else if (targets.includes('commonjs')) {
    entryFields.main = entries.commonjs;
  } else if (targets.includes('module')) {
    entryFields.main = entries.module;
  }

  for (const key in entryFields) {
    const entry = entryFields[key as keyof typeof entryFields];

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

      if (t === 'commonjs' || t === 'module') {
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

  process.stdout.write(
    dedent(`
    Project ${kleur.yellow(pkg.name)} configured successfully!

    ${kleur.magenta(
      `${kleur.bold('Perform last steps')} by running`
    )}${kleur.gray(':')}

      ${kleur.gray('$')} ${packageManager} install

    ${kleur.yellow('Good luck!')}
  `)
  );
}

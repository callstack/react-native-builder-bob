import fs from 'fs-extra';
import path from 'node:path';
import { applyTemplate, type TemplateConfiguration } from '../template';
import sortObjectKeys from './sortObjectKeys';

type Tool = {
  name: string;
  description: string;
  package: Record<string, unknown>;
  condition?: (config: TemplateConfiguration) => boolean;
};

type Options = {
  tools: string[];
  root: string;
  packageJson: Record<string, unknown>;
  config: TemplateConfiguration;
};

const ESLINT = {
  name: 'ESLint with Prettier',
  description: 'Lint and format code',
  package: {
    scripts: {
      lint: 'eslint "**/*.{js,ts,tsx}"',
    },
    prettier: {
      quoteProps: 'consistent',
      singleQuote: true,
      tabWidth: 2,
      trailingComma: 'es5',
      useTabs: false,
    },
    devDependencies: {
      '@eslint/compat': '^1.3.2',
      '@eslint/eslintrc': '^3.3.1',
      '@eslint/js': '^9.35.0',
      '@react-native/eslint-config': '^0.81.1',
      'eslint-config-prettier': '^10.1.8',
      'eslint-plugin-prettier': '^5.5.4',
      'eslint': '^9.35.0',
      'prettier': '^2.8.8',
    },
  },
};

const LEFTHOOK = {
  name: 'Lefthook with Commitlint',
  description: 'Manage Git hooks and lint commit messages',
  package: {
    commitlint: {
      extends: ['@commitlint/config-conventional'],
    },
    devDependencies: {
      '@commitlint/config-conventional': '^19.8.1',
      'commitlint': '^19.8.1',
      'lefthook': '^2.0.3',
    },
  },
};

const RELEASE_IT = {
  name: 'Release It',
  description: 'Automate versioning and package publishing tasks',
  package: {
    'scripts': {
      release: 'release-it --only-version',
    },
    'release-it': {
      git: {
        // eslint-disable-next-line no-template-curly-in-string
        commitMessage: 'chore: release ${version}',
        // eslint-disable-next-line no-template-curly-in-string
        tagName: 'v${version}',
      },
      npm: {
        publish: true,
      },
      github: {
        release: true,
      },
      plugins: {
        '@release-it/conventional-changelog': {
          preset: {
            name: 'angular',
          },
        },
      },
    },
    'devDependencies': {
      'release-it': '^19.0.4',
      '@release-it/conventional-changelog': '^10.0.1',
    },
  },
};

const JEST = {
  name: 'Jest',
  description: 'Test JavaScript and TypeScript code',
  package: {
    scripts: {
      test: 'jest',
    },
    jest: {
      preset: 'react-native',
      modulePathIgnorePatterns: [
        '<rootDir>/example/node_modules',
        '<rootDir>/lib/',
      ],
    },
    devDependencies: {
      '@types/jest': '^29.5.14',
      'jest': '^29.7.0',
    },
  },
};

const TURBOREPO = {
  name: 'Turborepo',
  description: 'Cache build outputs on CI',
  package: {
    devDependencies: {
      turbo: '^2.5.6',
    },
  },
  condition: (config: TemplateConfiguration) => config.example !== 'expo',
};

export const AVAILABLE_TOOLS = {
  'eslint': ESLINT,
  'jest': JEST,
  'lefthook': LEFTHOOK,
  'release-it': RELEASE_IT,
} as const satisfies Record<string, Tool>;

const REQUIRED_TOOLS = {
  turbo: TURBOREPO,
} as const satisfies Record<string, Tool>;

const ALL_TOOLS = {
  ...AVAILABLE_TOOLS,
  ...REQUIRED_TOOLS,
} as const;

export async function configureTools({
  tools,
  config,
  root,
  packageJson,
}: Options) {
  for (const key of [
    ...tools,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    ...(Object.keys(REQUIRED_TOOLS) as (keyof typeof REQUIRED_TOOLS)[]),
  ]) {
    if (!(key in ALL_TOOLS)) {
      throw new Error(
        `Invalid tool '${key}'. Available tools are: ${Object.keys(
          AVAILABLE_TOOLS
        ).join(', ')}.`
      );
    }

    // @ts-expect-error: We checked the key above
    const tool: Tool = ALL_TOOLS[key];

    if (tool.condition && !tool.condition(config)) {
      continue;
    }

    const files = path.resolve(__dirname, `../../templates/tools/${key}`);

    if (fs.existsSync(files)) {
      await applyTemplate(config, files, root);
    }

    for (const [key, value] of Object.entries(tool.package)) {
      if (
        typeof value === 'object' &&
        value !== null &&
        !Array.isArray(value)
      ) {
        if (typeof packageJson[key] === 'object' || packageJson[key] == null) {
          packageJson[key] = {
            ...packageJson[key],
            ...value,
          };

          if (
            key === 'dependencies' ||
            key === 'devDependencies' ||
            key === 'peerDependencies'
          ) {
            // @ts-expect-error: We know they are objects here
            packageJson[key] = sortObjectKeys(packageJson[key]);
          }
        } else {
          throw new Error(
            `Cannot merge '${key}' field because it is not an object (got '${String(packageJson[key])}').`
          );
        }
      } else {
        packageJson[key] = value;
      }
    }
  }
}

import fs from 'fs-extra';
import path from 'node:path';
import { applyTemplate, type TemplateConfiguration } from '../template';
import sortObjectKeys from './sortObjectKeys';

type Tool = {
  name: string;
  description: string;
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
};

const LEFTHOOK = {
  name: 'Lefthook with Commitlint',
  description: 'Manage Git hooks and lint commit messages',
};

const RELEASE_IT = {
  name: 'Release It',
  description: 'Automate versioning and package publishing tasks',
};

const JEST = {
  name: 'Jest',
  description: 'Test JavaScript and TypeScript code',
};

const TURBOREPO = {
  name: 'Turborepo',
  description: 'Cache build outputs on CI',
};

export const AVAILABLE_TOOLS = {
  eslint: ESLINT,
  jest: JEST,
  lefthook: LEFTHOOK,
  'release-it': RELEASE_IT,
} as const satisfies Record<string, Tool>;

const REQUIRED_TOOLS = {
  turborepo: TURBOREPO,
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

    const toolDir = path.resolve(__dirname, `../../templates/tools/${key}`);

    if (fs.existsSync(toolDir)) {
      await applyTemplate(config, toolDir, root);
    }

    const pkgPath = path.join(toolDir, '~package.json');

    if (fs.existsSync(pkgPath)) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
      const toolPkg = (await fs.readJson(pkgPath)) as Record<string, unknown>;

      for (const [field, value] of Object.entries(toolPkg)) {
        if (
          typeof value === 'object' &&
          value !== null &&
          !Array.isArray(value)
        ) {
          if (
            typeof packageJson[field] === 'object' ||
            packageJson[field] == null
          ) {
            packageJson[field] = {
              ...packageJson[field],
              ...value,
            };

            if (
              field === 'dependencies' ||
              field === 'devDependencies' ||
              field === 'peerDependencies'
            ) {
              // @ts-expect-error: We know they are objects here
              packageJson[field] = sortObjectKeys(packageJson[field]);
            }
          } else {
            throw new Error(
              `Cannot merge '${field}' field because it is not an object (got '${String(packageJson[field])}').`
            );
          }
        } else {
          packageJson[field] = value;
        }
      }
    }
  }
}

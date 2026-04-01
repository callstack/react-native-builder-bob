import fs from 'fs-extra';
import path from 'node:path';
import { applyTemplate, type TemplateConfiguration } from '../template';
import sortObjectKeys from './sortObjectKeys';

type PackageJson = {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  [key: string]: unknown;
};

type Tool = {
  name: string;
  description: string;
  condition?: (context: Pick<TemplateConfiguration, 'example'>) => boolean;
  postprocess?: (options: {
    config: TemplateConfiguration;
    root: string;
  }) => void | Promise<void>;
};

type Options = {
  tools: string[];
  root: string;
  packageJson: PackageJson;
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

const VITE: Tool = {
  name: 'Vite',
  description: 'Add web support to the example app',
  condition: (config) => config.example != null && config.example !== 'expo',
  postprocess: async ({ root }) => {
    const examplePkgPath = path.join(root, 'example', 'package.json');

    if (!fs.existsSync(examplePkgPath)) {
      throw new Error("Couldn't find the example app's package.json.");
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    const examplePackageJson = (await fs.readJson(
      examplePkgPath
    )) as PackageJson;

    const reactVersion =
      examplePackageJson.dependencies?.react ??
      examplePackageJson.devDependencies?.react;

    if (reactVersion == null) {
      throw new Error("Couldn't find the package 'react' in the example app.");
    }

    examplePackageJson.dependencies = sortObjectKeys({
      ...examplePackageJson.dependencies,
      'react-dom': reactVersion,
    });

    await fs.writeJson(examplePkgPath, examplePackageJson, { spaces: 2 });
  },
};

export const AVAILABLE_TOOLS = {
  eslint: ESLINT,
  jest: JEST,
  lefthook: LEFTHOOK,
  'release-it': RELEASE_IT,
  vite: VITE,
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

    const examplePkgPath = path.join(toolDir, 'example', '~package.json');

    await mergePackageJsonTemplate(
      path.join(toolDir, '~package.json'),
      packageJson
    );

    if (fs.existsSync(examplePkgPath)) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
      const existingExamplePackageJson = (await fs.readJson(
        path.join(root, 'example', 'package.json')
      )) as PackageJson;

      await mergePackageJsonTemplate(
        examplePkgPath,
        existingExamplePackageJson
      );

      await fs.writeJson(
        path.join(root, 'example', 'package.json'),
        existingExamplePackageJson,
        {
          spaces: 2,
        }
      );
    }

    await tool.postprocess?.({ config, root });
  }
}

async function mergePackageJsonTemplate(
  templatePath: string,
  packageJson: PackageJson
) {
  if (!fs.existsSync(templatePath)) {
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  const template = (await fs.readJson(templatePath)) as PackageJson;

  for (const [field, value] of Object.entries(template)) {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
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

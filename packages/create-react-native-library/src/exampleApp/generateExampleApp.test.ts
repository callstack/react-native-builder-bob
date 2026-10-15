import os from 'node:os';
import path from 'node:path';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
// Vitest is provided by the repository test runner and is not a package dependency.
// eslint-disable-next-line import-x/no-extraneous-dependencies
import { afterEach, expect, test, vi } from 'vitest';
import type { TemplateConfiguration } from '../template.ts';
import { spawn } from '../utils/spawn.ts';
import generateExampleApp from './generateExampleApp.ts';

vi.mock('../utils/spawn.ts', () => ({
  spawn: vi.fn(),
}));

afterEach(() => {
  vi.clearAllMocks();
});

test('uses the latest Community CLI for vanilla example apps', async () => {
  const root = await mkdtemp(
    path.join(os.tmpdir(), 'create-react-native-library-')
  );

  try {
    await mkdir(path.join(root, 'example'));
    await writeFile(
      path.join(root, 'example', 'package.json'),
      JSON.stringify({
        dependencies: {},
        devDependencies: {},
        scripts: {},
      })
    );

    const config: TemplateConfiguration = {
      author: {
        email: '',
        name: '',
        url: '',
      },
      example: 'vanilla',
      project: {
        cpp: false,
        description: 'Test project',
        identifier: 'test',
        moduleConfig: 'turbo-modules',
        name: 'Test',
        native: true,
        package: 'test',
        package_cpp: 'test',
        package_dir: 'test',
        slug: 'test',
        sourceCondition: 'test-source',
        swift: false,
        viewConfig: null,
      },
      repo: '',
      tools: [],
      versions: {
        bob: '0.0.0',
        nitro: undefined,
      },
      year: 2026,
    };

    await generateExampleApp({
      config,
      reactNativeVersion: undefined,
      root,
    });

    const args = vi.mocked(spawn).mock.calls[0]?.[1];

    expect(args?.[0]).toBe('@react-native-community/cli@latest');
  } finally {
    await rm(root, { force: true, recursive: true });
  }
});

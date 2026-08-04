import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { type } from 'arktype';
import fs from 'fs-extra';
import { expect, test, vi } from 'vitest';
import { config } from '../schema.ts';
import type { Report } from '../types.ts';
import compile from '../utils/compile.ts';
import { compileSwc } from '../utils/compileSwc.ts';

const require = createRequire(import.meta.url);

const report: Report = {
  info: vi.fn(),
  warn: vi.fn(),
  success: vi.fn(),
  error: vi.fn(),
};

const getResult = (module: unknown) => {
  if (
    module != null &&
    typeof module === 'object' &&
    'result' in module &&
    typeof module.result === 'number'
  ) {
    return module.result;
  }

  throw new Error('Compiled module did not export a numeric result.');
};

const buildLibrary = async (root: string, modules: 'commonjs' | 'preserve') => {
  const target = modules === 'commonjs' ? 'commonjs' : 'module';
  const output = path.join(root, 'lib', target);

  await fs.writeJSON(path.join(root, 'package.json'), {
    name: 'library',
    version: '1.0.0',
    source: './src/index.ts',
    main: `./lib/${target}/index.js`,
    exports: {
      '.': {
        default: `./lib/${target}/index.js`,
      },
    },
  });
  await fs.outputFile(
    path.join(root, 'src/index.ts'),
    [
      "import { value } from './value';",
      "export { value } from './value';",
      'export const result: number = value * 2;',
    ].join('\n')
  );
  await fs.outputFile(
    path.join(root, 'src/value.ts'),
    'export const value: number = 21;\n'
  );
  await fs.outputFile(path.join(root, 'src/metadata.json'), '{"value":21}\n');
  await fs.outputFile(
    path.join(root, 'src/explicit.mts'),
    'export const explicit: number = 42;\n'
  );

  await compile({
    compiler: 'swc',
    root,
    source: path.join(root, 'src'),
    output,
    exclude: '**/{__tests__,__fixtures__,__mocks__}/**',
    modules,
    esm: true,
    sourceMaps: true,
    jsxRuntime: 'automatic',
    variants: { [target]: true },
    report,
  });

  return output;
};

test.each([
  {
    modules: 'preserve',
    importText: "from './value.js'",
    load: async (filepath: string) =>
      getResult(await import(pathToFileURL(filepath).href)),
  },
  {
    modules: 'commonjs',
    importText: 'require("./value.js")',
    load: (filepath: string) => getResult(require(filepath)),
  },
] as const)(
  'compiles files with SWC to $modules modules',
  async ({ modules, importText, load }) => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), 'bob-swc-'));

    try {
      const output = await buildLibrary(root, modules);
      const indexPath = path.join(output, 'index.js');
      const index = await fs.readFile(indexPath, 'utf8');
      const sourceMap: unknown = await fs.readJSON(`${indexPath}.map`);

      if (sourceMap == null || typeof sourceMap !== 'object') {
        throw new Error('Invalid source map.');
      }

      expect(index).toContain(importText);
      expect(await load(indexPath)).toBe(42);
      expect(sourceMap).not.toHaveProperty('sourcesContent');
      expect(await fs.readJSON(path.join(output, 'metadata.json'))).toEqual({
        value: 21,
      });
      expect(await fs.readJSON(path.join(output, 'package.json'))).toEqual({
        type: modules === 'commonjs' ? 'commonjs' : 'module',
      });
      expect(
        await fs.readFile(path.join(output, 'explicit.mjs'), 'utf8')
      ).toContain('export const explicit');
    } finally {
      await fs.remove(root);
    }
  }
);

test('preserves codegen specs and their extensionless imports', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'bob-swc-codegen-'));
  const source = path.join(root, 'src');
  const output = path.join(root, 'lib/module');
  const spec = "export default codegenNativeComponent<Props>('Thing');\n";

  try {
    await fs.writeJSON(path.join(root, 'package.json'), {
      name: 'library',
      version: '1.0.0',
      source: './src/index.ts',
      main: './lib/module/index.js',
      codegenConfig: { name: 'LibrarySpec', type: 'all', jsSrcsDir: 'src' },
    });
    await fs.outputFile(
      path.join(source, 'index.ts'),
      "export { default } from './ThingNativeComponent';\n"
    );
    await fs.outputFile(path.join(source, 'ThingNativeComponent.tsx'), spec);

    await compile({
      compiler: 'swc',
      root,
      source,
      output,
      exclude: '**/{__tests__,__fixtures__,__mocks__}/**',
      modules: 'preserve',
      esm: true,
      sourceMaps: false,
      jsxRuntime: 'automatic',
      variants: { module: true },
      report,
    });

    expect(await fs.readFile(path.join(output, 'index.js'), 'utf8')).toContain(
      "from './ThingNativeComponent'"
    );
    expect(
      await fs.readFile(path.join(output, 'ThingNativeComponent.tsx'), 'utf8')
    ).toBe(spec);
  } finally {
    await fs.remove(root);
  }
});

test.each([
  { name: 'copyFlow', options: { compiler: 'swc', copyFlow: true } },
  { name: 'babelrc', options: { compiler: 'swc', babelrc: true } },
  {
    name: 'configFile',
    options: { compiler: 'swc', configFile: './babel.config.js' },
  },
])('rejects $name for the SWC compiler', ({ options }) => {
  const result = config({
    source: 'src',
    output: 'lib',
    targets: [['module', options]],
  });

  expect(result).toBeInstanceOf(type.errors);
});

test.each([
  { runtime: 'automatic', output: 'react/jsx-runtime' },
  { runtime: 'classic', output: 'React.createElement' },
] as const)(
  'compiles JSX with the $runtime runtime',
  async ({ runtime, output }) => {
    const root = process.cwd();

    const result = await compileSwc({
      code: 'export default <View />;',
      filepath: path.join(root, 'index.tsx'),
      outputFilename: path.join(root, 'lib/index.js'),
      root,
      source: root,
      modules: 'preserve',
      esm: false,
      sourceMaps: false,
      jsxRuntime: runtime,
      codegenEnabled: false,
    });

    expect(result.code).toContain(output);
  }
);

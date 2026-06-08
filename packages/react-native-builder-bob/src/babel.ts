import path from 'node:path';
import type { ConfigAPI, NodePath, PluginObj, PluginPass } from '@babel/core';
import type {
  ImportDeclaration,
  ExportAllDeclaration,
  ExportNamedDeclaration,
} from '@babel/types';
import { isCodegenSpec } from './utils/isCodegenSpec.ts';
import {
  resolveModuleSpecifier,
  SOURCE_EXTENSIONS,
} from './utils/resolveModuleSpecifier.ts';

type Options = {
  /**
   * Extension to add to the imports
   * For commonjs use 'cjs' and for esm use 'mjs'
   * NodeJS requires explicit extension for esm
   * The `cjs` extension avoids disambiguity when package.json has "type": "module"
   */
  extension?: 'js' | 'cjs' | 'mjs';
  /**
   * Out of tree platforms to support
   * For `import './file'`, we skip adding extension if `file.${platform}.ts` exists
   * This is necessary for the platform specific extensions to be resolve correctly
   * Bundlers won't resolve the platform specific extension if explicit extension is present
   */
  platforms?: string[];
};

const isTypeImport = (
  node: ImportDeclaration | ExportNamedDeclaration | ExportAllDeclaration
) =>
  ('importKind' in node && node.importKind === 'type') ||
  ('exportKind' in node && node.exportKind === 'type');

const assertFilename: (
  filename: string | null | undefined
) => asserts filename is string = (filename) => {
  if (filename == null) {
    throw new Error("Couldn't find a filename for the current file.");
  }
};

export default function (
  api: ConfigAPI,
  { extension, platforms }: Options
): PluginObj {
  api.assertVersion(7);

  const codegenEnabled = api.caller((caller) => caller?.codegenEnabled);

  const toExtensions = (sources: string[]) =>
    extension == null
      ? []
      : sources.map((source) => ({ source, output: extension }));

  const rewriteExtensions = toExtensions(
    extension ? [...SOURCE_EXTENSIONS, extension] : SOURCE_EXTENSIONS
  );

  const explicitRewriteExtensions = toExtensions(['ts', 'tsx']);

  function addExtension(
    {
      node,
    }: NodePath<
      ImportDeclaration | ExportNamedDeclaration | ExportAllDeclaration
    >,
    state: PluginPass
  ) {
    if (
      extension == null ||
      // Skip type imports as they'll be removed
      isTypeImport(node) ||
      // Skip non-relative imports
      !node.source?.value.startsWith('.')
    ) {
      return;
    }

    assertFilename(state.filename);

    const filename = path.resolve(
      path.dirname(state.filename),
      node.source.value
    );

    // Skip imports for codegen spec if codegen is enabled
    if (
      codegenEnabled &&
      (isCodegenSpec(filename) ||
        SOURCE_EXTENSIONS.some((ext) => isCodegenSpec(`${filename}.${ext}`)))
    ) {
      return;
    }

    node.source.value = resolveModuleSpecifier({
      filepath: state.filename,
      specifier: node.source.value,
      extensions: rewriteExtensions,
      explicitExtensions: explicitRewriteExtensions,
      platforms,
    });
  }

  return {
    name: 'react-native-builder-bob',
    visitor: {
      ImportDeclaration(path, state) {
        addExtension(path, state);
      },
      ExportNamedDeclaration(path, state) {
        addExtension(path, state);
      },
      ExportAllDeclaration(path, state) {
        addExtension(path, state);
      },
    },
  };
}

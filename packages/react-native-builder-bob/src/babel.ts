import fs from 'fs';
import path from 'path';
import type { ConfigAPI, NodePath, PluginObj, PluginPass } from '@babel/core';
import type {
  ImportDeclaration,
  ExportAllDeclaration,
  ExportNamedDeclaration,
} from '@babel/types';

type Options = {
  alias?: Record<string, string>;
  extension?: 'cjs' | 'mjs';
};

const isFile = (filename: string): boolean => {
  const exists =
    fs.lstatSync(filename, { throwIfNoEntry: false })?.isFile() ?? false;

  return exists;
};

const isDirectory = (filename: string): boolean => {
  const exists =
    fs.lstatSync(filename, { throwIfNoEntry: false })?.isDirectory() ?? false;

  return exists;
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
  { alias, extension }: Options
): PluginObj {
  api.assertVersion(7);

  function aliasImports(
    {
      node,
    }: NodePath<
      ImportDeclaration | ExportNamedDeclaration | ExportAllDeclaration
    >,
    state: PluginPass
  ) {
    if (
      alias == null ||
      // Skip type imports as they'll be removed
      isTypeImport(node) ||
      // Skip imports without a source
      !node.source?.value
    ) {
      return;
    }

    assertFilename(state.filename);

    const root = state.cwd;
    const source = node.source.value;

    for (const [key, value] of Object.entries(alias)) {
      if (source === key || source.startsWith(`${key}/`)) {
        const resolved = value.startsWith('.')
          ? path.relative(
              path.dirname(state.filename),
              path.resolve(root, value)
            )
          : value;

        node.source.value = source.replace(key, resolved);
        return;
      }
    }
  }

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

    // Skip folder imports
    const filename = path.resolve(
      path.dirname(state.filename),
      node.source.value
    );

    // Add extension if .ts file or file with extension exists
    if (
      isFile(`${filename}.ts`) ||
      isFile(`${filename}.tsx`) ||
      isFile(`${filename}.${extension}`)
    ) {
      node.source.value += `.${extension}`;
      return;
    }

    // Replace .ts extension with .js if .ts file exists
    if (isFile(filename)) {
      node.source.value = node.source.value.replace(/\.tsx?$/, `.${extension}`);
      return;
    }

    if (
      isDirectory(filename) &&
      (isFile(path.join(filename, 'index.ts')) ||
        isFile(path.join(filename, 'index.tsx')) ||
        isFile(path.join(filename, `index.${extension}`)))
    ) {
      node.source.value = node.source.value.replace(
        /\/?$/,
        `/index.${extension}`
      );
      return;
    }
  }

  return {
    name: '@builder-bob/babel-plugin',
    visitor: {
      ImportDeclaration(path, state) {
        aliasImports(path, state);
        addExtension(path, state);
      },
      ExportNamedDeclaration(path, state) {
        aliasImports(path, state);
        addExtension(path, state);
      },
      ExportAllDeclaration(path, state) {
        aliasImports(path, state);
        addExtension(path, state);
      },
    },
  };
}

import fs from 'fs';
import path from 'path';
import type { ConfigAPI, NodePath, PluginObj, PluginPass } from '@babel/core';
import type {
  ImportDeclaration,
  ExportAllDeclaration,
  ExportNamedDeclaration,
} from '@babel/types';

type Options = {
  extension?: 'cjs' | 'mjs';
};

const fileCache = new Map<string, string>();

const checkExists = (filename: string): boolean => {
  if (fileCache.has(filename)) {
    return true;
  }

  try {
    fs.accessSync(filename, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
};

export default function (api: ConfigAPI, { extension }: Options): PluginObj {
  api.assertVersion(7);

  function addExtension(
    {
      node,
    }: NodePath<
      ImportDeclaration | ExportNamedDeclaration | ExportAllDeclaration
    >,
    state: PluginPass
  ) {
    if (extension == null) {
      return;
    }

    if (!('source' in node) || !node.source?.value || !state.filename) {
      return;
    }

    // Skip `type` imports as they'll be removed
    if (
      ('importKind' in node && node.importKind === 'type') ||
      ('exportKind' in node && node.exportKind === 'type')
    ) {
      return;
    }

    // Skip non-relative imports
    if (!node.source?.value.startsWith('.')) {
      return;
    }

    // Skip folder imports
    const filename = path.resolve(
      path.dirname(state.filename),
      node.source.value
    );

    // Add .js extension if .ts file or file with extension exists
    if (
      checkExists(`${filename}.ts`) ||
      checkExists(`${filename}.${extension}`)
    ) {
      node.source.value += `.${extension}`;
      return;
    }

    // Replace .ts extension with .js if .ts file exists
    if (checkExists(filename)) {
      node.source.value = node.source.value.replace(/\.ts$/, `.${extension}`);
      return;
    }
  }

  return {
    name: '@builder-bob/babel-plugin',
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

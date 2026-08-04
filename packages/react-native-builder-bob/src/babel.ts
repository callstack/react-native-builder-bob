import type { ConfigAPI, NodePath, PluginObj, PluginPass } from '@babel/core';
import type {
  ImportDeclaration,
  ExportAllDeclaration,
  ExportNamedDeclaration,
} from '@babel/types';
import { resolveOutputModuleSpecifier } from './utils/resolveOutputModuleSpecifier.ts';

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

export default function (
  api: ConfigAPI,
  { extension, platforms }: Options
): PluginObj {
  api.assertVersion(7);

  const codegenEnabled = api.caller((caller) => caller?.codegenEnabled);

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
      node.source == null ||
      isTypeImport(node) ||
      !node.source.value.startsWith('.')
    ) {
      return;
    }

    const filepath = state.filename;

    if (filepath == null) {
      throw new Error("Couldn't find a filename for the current file.");
    }

    node.source.value = resolveOutputModuleSpecifier({
      filepath,
      specifier: node.source.value,
      extension,
      platforms,
      codegenEnabled,
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

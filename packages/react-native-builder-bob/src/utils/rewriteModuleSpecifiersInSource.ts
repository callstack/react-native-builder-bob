import path from 'node:path';
import MagicString from 'magic-string';
import ts from 'typescript';
import { resolveOutputModuleSpecifier } from './resolveOutputModuleSpecifier.ts';

type Options = {
  code: string;
  filepath: string;
  sourceFileName: string;
  extension?: 'js' | 'cjs' | 'mjs';
  sourceMaps: boolean;
  codegenEnabled?: boolean;
};

export function rewriteModuleSpecifiersInSource({
  code,
  filepath,
  sourceFileName,
  extension,
  sourceMaps,
  codegenEnabled,
}: Options) {
  if (extension == null) {
    return { code };
  }

  let scriptKind: ts.ScriptKind;

  switch (path.extname(filepath)) {
    case '.ts':
    case '.mts':
    case '.cts':
      scriptKind = ts.ScriptKind.TS;
      break;
    case '.tsx':
      scriptKind = ts.ScriptKind.TSX;
      break;
    default:
      scriptKind = ts.ScriptKind.JSX;
  }

  const sourceFile = ts.createSourceFile(
    filepath,
    code,
    ts.ScriptTarget.Latest,
    false,
    scriptKind
  );
  const output = new MagicString(code);
  let changed = false;

  const visit = (node: ts.Node) => {
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier != null &&
      ts.isStringLiteral(node.moduleSpecifier)
    ) {
      const specifier = node.moduleSpecifier.text;
      const rewritten = resolveOutputModuleSpecifier({
        filepath,
        specifier,
        extension,
        codegenEnabled,
        typeOnly:
          (ts.isImportDeclaration(node) &&
            node.importClause?.phaseModifier === ts.SyntaxKind.TypeKeyword) ||
          (ts.isExportDeclaration(node) && node.isTypeOnly),
      });

      if (rewritten !== specifier) {
        output.overwrite(
          node.moduleSpecifier.getStart(sourceFile) + 1,
          node.moduleSpecifier.getEnd() - 1,
          rewritten
        );
        changed = true;
      }
    }

    ts.forEachChild(node, visit);
  };

  visit(sourceFile);

  if (!changed) {
    return { code };
  }

  return {
    code: output.toString(),
    sourceMap: sourceMaps
      ? output
          .generateMap({
            hires: true,
            includeContent: false,
            source: sourceFileName,
          })
          .toString()
      : undefined,
  };
}

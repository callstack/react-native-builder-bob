import { existsSync } from 'node:fs';
import path from 'node:path';
import { isCodegenSpec } from './isCodegenSpec.ts';
import {
  resolveModuleSpecifier,
  SOURCE_EXTENSIONS,
} from './resolveModuleSpecifier.ts';

type Options = {
  filepath: string;
  specifier: string;
  extension: 'js' | 'cjs' | 'mjs';
  platforms?: string[];
  codegenEnabled?: boolean;
  typeOnly?: boolean;
};

export function resolveOutputModuleSpecifier({
  filepath,
  specifier,
  extension,
  platforms,
  codegenEnabled = false,
  typeOnly = false,
}: Options) {
  if (typeOnly || !specifier.startsWith('.')) {
    return specifier;
  }

  const filename = path.resolve(path.dirname(filepath), specifier);

  if (codegenEnabled) {
    const codegenCandidates = [
      filename,
      ...SOURCE_EXTENSIONS.map(
        (sourceExtension) => `${filename}.${sourceExtension}`
      ),
    ];

    if (
      codegenCandidates.some(
        (candidate) => existsSync(candidate) && isCodegenSpec(candidate)
      )
    ) {
      return specifier;
    }
  }

  const toExtensions = (sources: string[]) =>
    sources.map((source) => ({ source, output: extension }));

  return resolveModuleSpecifier({
    filepath,
    specifier,
    extensions: toExtensions([...SOURCE_EXTENSIONS, extension]),
    explicitExtensions: toExtensions(['ts', 'tsx']),
    platforms,
  });
}

import { decode, encode } from '@jridgewell/sourcemap-codec';
import { type } from 'arktype';
import fs from 'fs-extra';
import type ts from 'typescript';

export type Replacement = {
  start: number;
  end: number;
  value: string;
};

const sourceMap = type({
  version: 'number',
  file: 'string?',
  sourceRoot: 'string?',
  sources: 'string[]',
  names: 'string[]?',
  mappings: 'string',
  sourcesContent: 'string[]?',
}).onDeepUndeclaredKey('ignore');

export const updateSourceMap = async ({
  filepath,
  replacements,
  sourceFile,
}: {
  filepath: string;
  replacements: Replacement[];
  sourceFile: ts.SourceFile;
}) => {
  const map = sourceMap.assert(await fs.readJSON(filepath));
  const lines = decode(map.mappings);

  let changed = false;

  // Sort replacements in reverse order
  // We apply replacements from the end, so earlier offsets stay valid
  // So we won't have to keep track of changes as we go
  const sortedReplacements = [...replacements].sort(
    (a, b) => b.start - a.start
  );

  for (const replacement of sortedReplacements) {
    // Get line and column of the replacements from the absolute character offsets
    const start = sourceFile.getLineAndCharacterOfPosition(replacement.start);
    const end = sourceFile.getLineAndCharacterOfPosition(replacement.end);

    // We add file extensions which only affect single lines
    // So we don't handle multi-line replacements to avoid complexity
    if (start.line !== end.line) {
      throw new Error(
        'Source map replacement spanning multiple lines is not supported.'
      );
    }

    // Get the amount of characters added or removed by the replacement
    // e.g. `./foo` -> `./foo.js` adds 3 characters, so delta is 3
    const delta =
      replacement.value.length - (replacement.end - replacement.start);

    if (delta === 0) {
      continue;
    }

    const segments = lines[start.line];

    if (segments) {
      for (const segment of segments) {
        // If a mapping points to text at or after the end of the replaced import string,
        // move that mapping by the same number of characters the replacement added or removed
        if (segment[0] >= end.character) {
          segment[0] += delta;
          changed = true;
        }
      }
    }
  }

  if (!changed) {
    return;
  }

  await fs.writeJSON(filepath, {
    ...map,
    mappings: encode(lines),
  });
};

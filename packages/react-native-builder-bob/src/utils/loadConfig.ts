import { join } from 'node:path';
import { createRequire } from 'node:module';
import pack from '../../package.json' with { type: 'json' };

const require = createRequire(import.meta.url);

const searchPlaces = [
  'bob.config.mjs',
  'bob.config.cjs',
  'bob.config.js',
  'package.json',
];

export const loadConfig = (
  root: string
): { filepath: string; config: unknown } | undefined => {
  for (const filename of searchPlaces) {
    const result = requireConfig(root, filename);

    if (filename === 'package.json' && result != null) {
      if (result.content[pack.name] != null) {
        return {
          filepath: result.filepath,
          config: result.content[pack.name],
        };
      }
    }

    if (result != null) {
      const content = result.content;

      if (content?.__esModule) {
        return {
          filepath: result.filepath,
          config: content.default,
        };
      }

      return {
        filepath: result.filepath,
        config: content,
      };
    }
  }

  return undefined;
};

const requireConfig = (root: string, filename: string) => {
  const filepath = join(root, filename);

  try {
    const content = require(filepath);

    return {
      filepath,
      content,
    };
  } catch (e) {
    if (
      typeof e === 'object' &&
      e != null &&
      'code' in e &&
      e.code === 'MODULE_NOT_FOUND'
    ) {
      // We expect that some of the config files won't exist
      // So we just return undefined in that case
      return undefined;
    }

    throw e;
  }
};

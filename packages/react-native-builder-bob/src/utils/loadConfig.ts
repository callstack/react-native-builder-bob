import { join } from 'path';
import { name } from '../../package.json';

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
      if (result.content[name] != null) {
        return {
          filepath: result.filepath,
          config: result.content[name],
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
    // eslint-disable-next-line @typescript-eslint/no-require-imports
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

import fs from 'node:fs';
import path from 'node:path';

const SUPPORTED_PLATFORMS = [
  'native',
  'android',
  'ios',
  'windows',
  'macos',
  'visionos',
  'web',
  'tv',
  'android.tv',
  'ios.tv',
];

export const SOURCE_EXTENSIONS = ['ts', 'tsx', 'js', 'jsx'];

type Extension = {
  source: string;
  output: string;
};

type ExplicitExtension = { source: string } & (
  | { output: string }
  | { emitted: Extension[] }
);

type Options = {
  filepath: string;
  specifier: string;
  extensions: Extension[];
  explicitExtensions?: ExplicitExtension[];
  platforms?: string[];
};

const isFile = (filename: string): boolean =>
  fs.lstatSync(filename, { throwIfNoEntry: false })?.isFile() ?? false;

const isDirectory = (filename: string): boolean =>
  fs.lstatSync(filename, { throwIfNoEntry: false })?.isDirectory() ?? false;

const getModuleExtension = (
  filename: string,
  extensions: Extension[],
  platforms: string[]
) => {
  return extensions.find(
    ({ source }) =>
      isFile(`${filename}.${source}`) &&
      // Keep platform-specific imports extensionless so bundlers can still pick the right file.
      platforms.every(
        (platform) => !isFile(`${filename}.${platform}.${source}`)
      )
  )?.output;
};

export const resolveModuleSpecifier = ({
  filepath,
  specifier,
  extensions,
  explicitExtensions = [],
  platforms = SUPPORTED_PLATFORMS,
}: Options) => {
  if (!specifier.startsWith('.')) {
    return specifier;
  }

  const filename = path.resolve(path.dirname(filepath), specifier);
  const explicitExtension = explicitExtensions.find(({ source }) =>
    filename.endsWith(`.${source}`)
  );

  if (explicitExtension) {
    let output: string | undefined;

    if ('emitted' in explicitExtension) {
      // An explicit extension already opts out of bundler platform resolution,
      // so rewrite to the emitted file regardless of platform-specific variants
      output = getModuleExtension(
        filename.slice(0, -(explicitExtension.source.length + 1)),
        explicitExtension.emitted,
        []
      );
    } else if (isFile(filename)) {
      output = explicitExtension.output;
    }

    if (output) {
      return specifier.slice(0, -explicitExtension.source.length) + output;
    }

    return specifier;
  }

  const extension = getModuleExtension(filename, extensions, platforms);

  if (extension) {
    return `${specifier}.${extension}`;
  }

  if (isDirectory(filename)) {
    const indexExtension = getModuleExtension(
      path.join(filename, 'index'),
      extensions,
      platforms
    );

    if (indexExtension) {
      // Directory imports need to point to the emitted index file in JS and declarations
      return specifier.replace(/\/?$/, `/index.${indexExtension}`);
    }
  }

  return specifier;
};

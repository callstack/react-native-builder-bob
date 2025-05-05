import fs from 'fs-extra';

export function isCodegenSpec(filepath: string): boolean {
  const looksLikeCodgenSpec =
    /(?:^|[\\/])(?:(\w+)NativeComponent)\.[jt]sx?$/i.test(filepath);

  if (looksLikeCodgenSpec) {
    // This is used in the babel plugin so needs to be synchronous
    const content = fs.readFileSync(filepath, 'utf8');

    // Regex taken from https://github.com/facebook/react-native/blob/271232d85654cee32322b1c8a3a39ef647ad02e2/packages/react-native-babel-preset/src/configs/main.js#L78C24-L78C47
    if (/\bcodegenNativeComponent</.test(content)) {
      return true;
    }
  }

  return false;
}

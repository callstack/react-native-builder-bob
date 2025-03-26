export const isCodegenSpec = (filepath: string) => {
  return /(?:^|[\\/])(?:Native\w+|(\w+)NativeComponent)\.[jt]sx?$/i.test(
    filepath
  );
};

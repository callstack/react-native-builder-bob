export default function isFabricComponentFile(filepath: string): boolean {
  return /(?:^|[\\/])(?:Native\w+|(\w+)NativeComponent)\.[jt]sx?$/.test(
    filepath
  );
}

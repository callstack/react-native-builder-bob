export default function sortObjectKeys<T extends Record<string, unknown>>(
  obj: T
): T {
  // eslint-disable-next-line @typescript-eslint/require-array-sort-compare
  return (Object.keys(obj) as (keyof T)[]).sort().reduce((acc, key) => {
    acc[key] = obj[key];
    return acc;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  }, {} as T);
}

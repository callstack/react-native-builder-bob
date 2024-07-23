export default function sortObjectKeys<T extends Record<string, unknown>>(
  obj: T
): T {
  return (Object.keys(obj) as (keyof T)[]).sort().reduce((acc, key) => {
    acc[key] = obj[key];
    return acc;
  }, {} as T);
}

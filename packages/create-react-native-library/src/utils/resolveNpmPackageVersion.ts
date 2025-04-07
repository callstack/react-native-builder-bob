import { spawn } from './spawn.ts';

export async function resolveNpmPackageVersion(
  name: string,
  fallback: string,
  timeout: number = 1000
): Promise<string> {
  let result: string;

  try {
    const promise = spawn('npm', ['view', name, 'dist-tags.latest']);

    result = await Promise.race([
      new Promise<string>((resolve) => {
        setTimeout(() => resolve(fallback), timeout);
      }),
      promise,
    ]);
  } catch (e) {
    result = fallback;
  }

  return result;
}

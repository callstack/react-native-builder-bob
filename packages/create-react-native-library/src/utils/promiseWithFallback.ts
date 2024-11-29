import { spawn } from './spawn';

export function promiseWithFallback<T>(
  promise: Promise<T>,
  fallback: T,
  timeout: number
): () => Promise<T> {
  async function forceResolve() {
    let result: T;

    try {
      result = await Promise.race([
        new Promise<T>((resolve) => {
          setTimeout(() => resolve(fallback), timeout);
        }),
        promise,
      ]);
    } catch (e) {
      result = fallback;
    }
    return result;
  }

  return forceResolve;
}

export const resolveBobVersionWithFallback = (fallback: string) =>
  promiseWithFallback(
    spawn('npm', ['view', 'react-native-builder-bob', 'dist-tags.latest']),
    fallback,
    1000
  );

export const resolveNitroModulesVersionWithFallback = (fallback: string) =>
  promiseWithFallback(
    spawn('npm', ['view', 'react-native-nitro-modules', 'dist-tags.latest']),
    fallback,
    1000
  );

export const resolveNitroCodegenVersionWithFallback = (fallback: string) =>
  promiseWithFallback(
    spawn('npm', ['view', 'nitro-codegen', 'dist-tags.latest']),
    fallback,
    1000
  );

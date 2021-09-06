export function debounce<C extends (...args: any[]) => void, A extends any[]>(
  callback: C,
  duration: number
): (...args: A) => number {
  let timeout = 0;
  let start = 0;
  return (...args: A): number => {
    start = start || Date.now();
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = (setTimeout(() => {
      callback(...args);
      clearTimeout(timeout);
    }, duration) as unknown) as number;

    return timeout;
  };
}

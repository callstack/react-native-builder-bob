import del from 'del';

export async function rmrf(
  pattern: string | readonly string[],
  options: { root: string }
) {
  await del(pattern, { cwd: options.root });
}

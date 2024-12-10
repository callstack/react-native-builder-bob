import kleur from 'kleur';
import { spawn } from './spawn';

export async function assertNpxExists() {
  try {
    await spawn('npx', ['--help']);
  } catch (error) {
    // @ts-expect-error: TS doesn't know about `code`
    if (error != null && error.code === 'ENOENT') {
      throw new Error(
        `Couldn't find ${kleur.blue(
          'npx'
        )}! Please install it by running ${kleur.blue('npm install -g npx')}`
      );
    } else {
      throw error;
    }
  }
}

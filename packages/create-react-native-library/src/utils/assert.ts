import kleur from 'kleur';
import { spawn } from './spawn';

export async function assertNpx() {
  try {
    await spawn('npx', ['--help']);
  } catch (error) {
    // @ts-expect-error: TS doesn't know about `code`
    if (error != null && error.code === 'ENOENT') {
      console.log(
        `Couldn't find ${kleur.blue(
          'npx'
        )}! Please install it by running ${kleur.blue('npm install -g npx')}`
      );

      process.exit(1);
    } else {
      throw error;
    }
  }
}

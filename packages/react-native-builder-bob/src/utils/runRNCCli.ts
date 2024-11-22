import { type SpawnOptions } from 'node:child_process';
import { spawn } from './spawn';

/**
 * Runs the React Native Community CLI with the specified arguments
 */
export async function runRNCCli(
  args: string[],
  options: SpawnOptions = {
    stdio: ['ignore', 'ignore', 'pipe'],
  }
) {
  return await spawn('npx', ['@react-native-community/cli', ...args], options);
}

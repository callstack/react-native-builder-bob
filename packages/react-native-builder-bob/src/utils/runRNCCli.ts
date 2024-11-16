import assert from 'node:assert';
import type { SpawnOptions } from 'node:child_process';
import path from 'node:path';
import fs from 'fs-extra';
import { spawn } from './spawn';

// This is a special case for calling bob from the XCode scripts
// XCode scripts don't have the node binary properly set
// We expose an env value for node instead.
const NODE_BINARY = process.env['NODE_BINARY'] || 'node';

/**
 * Runs the React Native Community CLI with the specified arguments
 */
export async function runRNCCli(
  args: string[],
  options: SpawnOptions = {
    stdio: 'ignore',
  }
) {
  const rncCliBinaryName = await getCliBinaryName();

  const RNC_CLI_BINARY_PATH = path.resolve(
    process.cwd(), // We are always expected to run in the library
    'node_modules',
    '.bin',
    rncCliBinaryName
  );

  return await spawn(RNC_CLI_BINARY_PATH, [...args], options);
}

async function getCliBinaryName(): Promise<string> {
  const rncCliPackagePath = await spawn(NODE_BINARY, [
    '-e',
    `console.log(require.resolve('@react-native-community/cli/package.json'))`,
  ]);

  const rncCliPackage = await fs.readJson(rncCliPackagePath);
  const binProperty = rncCliPackage.bin as Record<string, string>;
  assert(
    typeof binProperty === 'object',
    "React Native CLI doesn't specify proper binaries"
  );

  const binaries = Object.keys(binProperty);
  const rncCliBinaryName = binaries[0] as string;
  assert(
    typeof rncCliBinaryName === 'string',
    "React Native Community CLI doesn't have any binaries to run"
  );

  return rncCliBinaryName;
}

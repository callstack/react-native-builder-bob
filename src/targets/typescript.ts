import path from 'path';
import child_process from 'child_process';
import del from 'del';
import * as logger from '../utils/logger';
import { Input } from '../types';

export default async function build({ root, output }: Input) {
  logger.info('building files for typscript target');

  await del([output]);

  child_process.execFileSync(path.join(root, 'node_modules', '.bin', 'tsc'), [
    '--declaration',
    '--emitDeclarationOnly',
    '--outDir',
    output,
  ]);

  logger.info(`wrote definition files to ${path.relative(root, output)}`);
}

import {
  Worker,
  isMainThread,
  parentPort,
  workerData,
} from 'node:worker_threads';
import codegen from '../targets/codegen/index.ts';
import commonjs from '../targets/commonjs.ts';
import custom from '../targets/custom.ts';
import module from '../targets/module.ts';
import typescript from '../targets/typescript.ts';
import type { Report } from '../types.ts';
import type { Target } from '../schema.ts';

type WorkerData<T extends Target> = {
  target: T;
  data: Omit<Parameters<(typeof targets)[T]>[0], 'report'>;
};

const targets = {
  commonjs,
  module,
  typescript,
  codegen,
  custom,
} as const;

export const run = async <T extends Target>(
  target: T,
  { report, ...data }: Parameters<(typeof targets)[T]>[0]
) => {
  if (!isMainThread) {
    throw new Error('Worker can only be run from the main thread');
  }

  return new Promise<void>((resolve, reject) => {
    const worker = new Worker(__filename, {
      workerData: {
        target,
        data,
      } satisfies WorkerData<T>,
      env: {
        ...process.env,
        FORCE_COLOR: process.stdout.isTTY ? '1' : '0',
      },
    });

    worker.on('message', (message) => {
      switch (message.type) {
        case 'info':
          report.info(message.message);
          break;
        case 'warn':
          report.warn(message.message);
          break;
        case 'error':
          report.error(message.message);
          break;
        case 'success':
          report.success(message.message);
          break;
      }
    });

    worker.on('error', (error) => {
      reject(error);
    });

    worker.on('exit', (code) => {
      if (code !== 0) {
        reject(new Error(`Worker exited with code ${code}`));
      } else {
        resolve();
      }
    });
  });
};

if (!isMainThread) {
  const { target, data } = workerData as WorkerData<Target>;

  const report: Report = {
    info: (message) => parentPort?.postMessage({ type: 'info', message }),
    warn: (message) => parentPort?.postMessage({ type: 'warn', message }),
    error: (message) => parentPort?.postMessage({ type: 'error', message }),
    success: (message) => parentPort?.postMessage({ type: 'success', message }),
  };

  if (target in targets) {
    // @ts-expect-error - typescript doesn't support correlated union types https://github.com/microsoft/TypeScript/issues/30581
    targets[target]({ ...data, report });
  } else {
    throw new Error(`Unknown target: ${target}`);
  }
}

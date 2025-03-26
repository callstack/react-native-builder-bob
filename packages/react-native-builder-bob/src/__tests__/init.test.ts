import { afterEach, beforeEach, expect, it, jest } from '@jest/globals';
import { readFile } from 'fs-extra';
import mockFs from 'mock-fs';
import { stdin } from 'mock-stdin';
import { join } from 'path';
import { init } from '../init';

let io: ReturnType<typeof stdin> | undefined;

const root = '/path/to/library';

const enter = '\x0D';

const waitFor = async (callback: () => void) => {
  const interval = 10;

  let timeout = 50;

  return new Promise((resolve, reject) => {
    const intervalId = setInterval(() => {
      try {
        callback();
        clearInterval(intervalId);
        resolve(undefined);
      } catch (error) {
        if (timeout <= 0) {
          clearInterval(intervalId);
          reject(error);
        }

        timeout -= interval;
      }
    }, interval);
  });
};

beforeEach(() => {
  io = stdin();

  mockFs({
    [root]: {
      'package.json': JSON.stringify({
        name: 'library',
        version: '1.0.0',
      }),
      'src': {
        'index.ts': "export default 'hello world';",
      },
    },
  });
});

afterEach(() => {
  io?.restore();
  mockFs.restore();
  jest.restoreAllMocks();
});

it('initializes the configuration', async () => {
  jest.spyOn(process.stdout, 'write').mockImplementation(() => true);

  process.chdir(root);

  const run = async () => {
    await waitFor(() => {
      const lastCall = (process.stdout.write as jest.Mock).mock.lastCall;

      if (lastCall == null) {
        throw new Error('No output');
      }

      if (/The working directory is not clean/.test(String(lastCall[0]))) {
        io?.send('y');
      }
    });

    await waitFor(() =>
      expect(process.stdout.write).toHaveBeenLastCalledWith(
        expect.stringMatching('Where are your source files?')
      )
    );

    io?.send(enter);

    await waitFor(() =>
      expect(process.stdout.write).toHaveBeenLastCalledWith(
        expect.stringMatching('Where do you want to generate the output files?')
      )
    );

    io?.send(enter);

    await waitFor(() =>
      expect(process.stdout.write).toHaveBeenLastCalledWith(
        expect.stringMatching('Which targets do you want to build?')
      )
    );

    io?.send(enter);

    await waitFor(() =>
      expect(process.stdout.write).toHaveBeenLastCalledWith(
        expect.stringMatching(
          "You have enabled 'typescript' compilation, but we couldn't find a 'tsconfig.json' in project root"
        )
      )
    );

    io?.send(enter);
  };

  await Promise.all([run(), init()]);

  expect(process.stdout.write).toHaveBeenLastCalledWith(
    expect.stringMatching('configured successfully!')
  );

  expect(await readFile(join(root, 'package.json'), 'utf8')).toMatchSnapshot();

  expect(await readFile(join(root, 'tsconfig.json'), 'utf8')).toMatchSnapshot();
});

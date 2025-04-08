import crossSpawn from 'cross-spawn';

export const spawn = async (...args: Parameters<typeof crossSpawn>) => {
  return new Promise<string>((resolve, reject) => {
    const child = crossSpawn(...args);

    let stdout = '';
    let stderr = '';

    child.stdout?.setEncoding('utf8');
    child.stdout?.on('data', (data) => {
      stdout += data;
    });

    child.stderr?.setEncoding('utf8');
    child.stderr?.on('data', (data) => {
      stderr += data;
    });

    child.once('error', reject);
    child.once('close', (code) => {
      if (code === 0) {
        resolve(stdout.trim());
      } else {
        const error = new Error(stderr.trim() || 'Unknown error');

        Object.defineProperties(error, {
          stdout: {
            enumerable: false,
            value: stdout,
          },
          stderr: {
            enumerable: false,
            value: stderr,
          },
          code: {
            enumerable: false,
            value: code,
          },
        });

        reject(error);
      }
    });
  });
};

import fs from 'node:fs/promises';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import {
  buildCliArgs,
  createArchiveSha256,
  encodeArchive,
  normalizeRequest,
  type GenerateArchiveResult,
  type GeneratedFile,
  type NormalizedGenerateLibraryRequest,
} from '#shared';

const port = Number(process.env.PORT || 8788);
const generatedDirectory = 'generated';

const server = http.createServer((request, response) => {
  void handleRequest(request, response);
});

server.listen(port, () => {
  console.log(`Runner listening on http://127.0.0.1:${String(port)}`);
});

async function generateArchive(
  request: NormalizedGenerateLibraryRequest
): Promise<GenerateArchiveResult> {
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'crnl-server-'));
  const outputDirectory = path.join(tempRoot, generatedDirectory);
  const archivePath = path.join(tempRoot, 'library.zip');
  const packageName =
    'create-react-native-library@' +
    String(request.createReactNativeLibraryVersion);

  try {
    await runCommand(
      'yarn',
      ['dlx', packageName, ...buildCliArgs(request, generatedDirectory)],
      tempRoot
    );

    const files = await collectFiles(outputDirectory);

    await runCommand(
      'zip',
      ['-qr', archivePath, '.', '-x', '.git', '.git/*'],
      outputDirectory
    );

    const archive = new Uint8Array(await fs.readFile(archivePath));
    const archiveSha256 = await createArchiveSha256(archive);

    return {
      archiveBase64: encodeArchive(archive),
      archiveSha256,
      archiveSize: archive.byteLength,
      files,
    };
  } finally {
    await fs.rm(tempRoot, {
      force: true,
      recursive: true,
    });
  }
}

async function collectFiles(root: string): Promise<GeneratedFile[]> {
  const files: GeneratedFile[] = [];

  await walk(root, root, files);

  files.sort((left: GeneratedFile, right: GeneratedFile) => {
    const leftPath = String(left.path);
    const rightPath = String(right.path);

    return leftPath.localeCompare(rightPath);
  });

  return files;
}

async function readJsonBody(request: http.IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];

  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  const body = Buffer.concat(chunks).toString('utf8');

  if (!body) {
    throw new Error('Request body must be valid JSON');
  }

  try {
    const parsed: unknown = JSON.parse(body);

    return parsed;
  } catch {
    throw new Error('Request body must be valid JSON');
  }
}

async function runCommand(
  command: string,
  args: string[],
  cwd: string
): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      env: {
        ...process.env,
        CI: '1',
      },
      stdio: 'pipe',
    });

    let stderr = '';

    child.stderr.on('data', (chunk: Buffer | string) => {
      stderr += chunk.toString();
    });

    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolve();

        return;
      }

      reject(
        new Error(
          stderr.trim() || `${command} exited with status code ${String(code)}`
        )
      );
    });
  });
}

async function walk(
  root: string,
  currentDirectory: string,
  files: GeneratedFile[]
): Promise<void> {
  const entries = await fs.readdir(currentDirectory, {
    withFileTypes: true,
  });

  for (const entry of entries) {
    if (entry.name === '.git') {
      continue;
    }

    const fullPath = path.join(currentDirectory, entry.name);

    if (entry.isDirectory()) {
      await walk(root, fullPath, files);

      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    const stats = await fs.stat(fullPath);

    files.push({
      path: path.relative(root, fullPath).split(path.sep).join('/'),
      size: stats.size,
    });
  }
}

function isValidationError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  return (
    error.message.includes('must be') ||
    error.message === 'Request body must be valid JSON'
  );
}

async function handleRequest(
  request: http.IncomingMessage,
  response: http.ServerResponse
): Promise<void> {
  if (request.method === 'GET' && request.url === '/health') {
    response.writeHead(200, {
      'content-type': 'application/json; charset=utf-8',
    });
    response.end(JSON.stringify({ ok: true }));

    return;
  }

  if (request.method !== 'POST' || request.url !== '/run') {
    response.writeHead(404, {
      'content-type': 'application/json; charset=utf-8',
    });
    response.end(JSON.stringify({ error: 'Not found' }));

    return;
  }

  try {
    const body = await readJsonBody(request);
    const normalizedRequest = normalizeRequest(body);
    const result = await generateArchive(normalizedRequest);

    response.writeHead(200, {
      'content-type': 'application/json; charset=utf-8',
    });
    response.end(JSON.stringify(result));
  } catch (error) {
    response.writeHead(isValidationError(error) ? 400 : 500, {
      'content-type': 'application/json; charset=utf-8',
    });
    response.end(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    );
  }
}

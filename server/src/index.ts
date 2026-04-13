import {
  createArchiveFilename,
  createArchiveKey,
  createArchivePath,
  createCacheKey,
  decodeArchive,
  normalizeRequest,
  type CachedGeneration,
  type GenerateArchiveResult,
  type NormalizedGenerateLibraryRequest,
} from '#shared';

type KVNamespace = {
  get(key: string): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
};

type R2Bucket = {
  get(key: string): Promise<R2ObjectBody | null>;
  put(
    key: string,
    value: Uint8Array,
    options?: {
      customMetadata?: Record<string, string>;
      httpMetadata?: {
        cacheControl?: string;
        contentDisposition?: string;
        contentType?: string;
      };
    }
  ): Promise<void>;
};

type R2ObjectBody = {
  body: ReadableStream<Uint8Array> | null;
  httpEtag: string;
  size: number;
  writeHttpMetadata(headers: Headers): void;
};

type Env = {
  GENERATION_ARCHIVES: R2Bucket;
  GENERATION_CACHE: KVNamespace;
  GENERATOR_ORIGIN: string;
};

const corsHeaders = {
  'Access-Control-Allow-Headers': 'content-type',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Origin': '*',
} as const;

const worker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: corsHeaders,
        status: 204,
      });
    }

    if (request.method === 'GET' && url.pathname === '/health') {
      return json({
        ok: true,
      });
    }

    if (request.method === 'POST' && url.pathname === '/generate') {
      return generate(request, env);
    }

    if (request.method === 'GET' && url.pathname.startsWith('/archives/')) {
      return getArchive(url.pathname, env);
    }

    return json(
      {
        error: 'Not found',
      },
      404
    );
  },
};

export default worker;

async function generate(request: Request, env: Env): Promise<Response> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return json(
      {
        error: 'Request body must be valid JSON',
      },
      400
    );
  }

  let normalizedRequest: NormalizedGenerateLibraryRequest;

  try {
    normalizedRequest = normalizeRequest(body);
  } catch (error) {
    return json(
      {
        error: toErrorMessage(error),
      },
      400
    );
  }

  const cacheKey = await createCacheKey(normalizedRequest);
  const cachedValue = await env.GENERATION_CACHE.get(cacheKey);

  if (cachedValue != null) {
    const cached = parseCachedGeneration(cachedValue);

    return json(toGenerateResponse(cached, request.url, true));
  }

  const runnerResponse = await fetch(new URL('/run', env.GENERATOR_ORIGIN), {
    body: JSON.stringify(normalizedRequest),
    headers: {
      'content-type': 'application/json',
    },
    method: 'POST',
  });

  if (!runnerResponse.ok) {
    const message = await runnerResponse.text();

    return json(
      {
        error: `Generation failed: ${message || runnerResponse.statusText}`,
      },
      502
    );
  }

  const generation = parseGenerateArchiveResult(await runnerResponse.text());
  const archiveBytes = decodeArchive(generation.archiveBase64);
  const archiveKey = createArchiveKey(cacheKey);
  const archivePath = createArchivePath(cacheKey);
  const archiveFilename = createArchiveFilename(normalizedRequest);
  const contentDisposition =
    'attachment; filename="' + String(archiveFilename) + '"';

  await env.GENERATION_ARCHIVES.put(archiveKey, archiveBytes, {
    customMetadata: {
      cacheKey,
      generatorVersion: normalizedRequest.createReactNativeLibraryVersion,
    },
    httpMetadata: {
      cacheControl: 'public, max-age=31536000, immutable',
      contentDisposition,
      contentType: 'application/zip',
    },
  });

  const cached: CachedGeneration = {
    archiveKey,
    archivePath,
    archiveSha256: generation.archiveSha256,
    archiveSize: generation.archiveSize,
    cacheKey,
    fileCount: generation.files.length,
    files: generation.files,
    generatedAt: new Date().toISOString(),
    generatorVersion: normalizedRequest.createReactNativeLibraryVersion,
    request: normalizedRequest,
  };

  await env.GENERATION_CACHE.put(cacheKey, JSON.stringify(cached));

  return json(toGenerateResponse(cached, request.url, false));
}

async function getArchive(pathname: string, env: Env): Promise<Response> {
  const archiveKey = pathname.slice(1);
  const archive = await env.GENERATION_ARCHIVES.get(archiveKey);

  if (archive?.body == null) {
    return json(
      {
        error: 'Archive not found',
      },
      404
    );
  }

  const headers = new Headers(corsHeaders);

  archive.writeHttpMetadata(headers);
  headers.set('etag', archive.httpEtag);

  return new Response(archive.body, {
    headers,
  });
}

function toGenerateResponse(
  cached: CachedGeneration,
  requestUrl: string,
  cacheHit: boolean
) {
  return {
    archive: {
      path: cached.archivePath,
      sha256: cached.archiveSha256,
      size: cached.archiveSize,
      url: new URL(cached.archivePath, requestUrl).toString(),
    },
    cacheHit,
    cacheKey: cached.cacheKey,
    fileCount: cached.fileCount,
    files: cached.files,
    generatedAt: cached.generatedAt,
    generatorVersion: cached.generatorVersion,
  };
}

function json(value: unknown, status: number = 200): Response {
  return new Response(JSON.stringify(value, null, 2), {
    headers: {
      ...corsHeaders,
      'content-type': 'application/json; charset=utf-8',
    },
    status,
  });
}

function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unknown error';
}

function parseCachedGeneration(value: string): CachedGeneration {
  const parsed: unknown = JSON.parse(value);

  if (!isCachedGeneration(parsed)) {
    throw new Error('Cached generation is invalid');
  }

  return parsed;
}

function parseGenerateArchiveResult(value: string): GenerateArchiveResult {
  const parsed: unknown = JSON.parse(value);

  if (!isGenerateArchiveResult(parsed)) {
    throw new Error('Generation response is invalid');
  }

  return parsed;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value != null;
}

function isCachedGeneration(value: unknown): value is CachedGeneration {
  return (
    isRecord(value) &&
    typeof value.archiveKey === 'string' &&
    typeof value.archivePath === 'string' &&
    typeof value.archiveSha256 === 'string' &&
    typeof value.archiveSize === 'number' &&
    typeof value.cacheKey === 'string' &&
    typeof value.fileCount === 'number' &&
    typeof value.generatedAt === 'string' &&
    typeof value.generatorVersion === 'string' &&
    Array.isArray(value.files) &&
    value.files.every(isGeneratedFile)
  );
}

function isGenerateArchiveResult(
  value: unknown
): value is GenerateArchiveResult {
  return (
    isRecord(value) &&
    typeof value.archiveBase64 === 'string' &&
    typeof value.archiveSha256 === 'string' &&
    typeof value.archiveSize === 'number' &&
    Array.isArray(value.files) &&
    value.files.every(isGeneratedFile)
  );
}

function isGeneratedFile(
  value: CachedGeneration['files'][number]
): value is CachedGeneration['files'][number] {
  return (
    isRecord(value) &&
    typeof value.path === 'string' &&
    typeof value.size === 'number'
  );
}

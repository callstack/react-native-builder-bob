const PROJECT_TYPES = [
  'turbo-module',
  'fabric-view',
  'nitro-module',
  'nitro-view',
  'library',
] as const;

const PROJECT_LANGUAGES = ['kotlin-objc', 'kotlin-swift', 'cpp', 'js'] as const;
const EXAMPLE_APPS = ['test-app', 'expo', 'vanilla', 'none'] as const;

export type ProjectType = (typeof PROJECT_TYPES)[number];
export type ProjectLanguage = (typeof PROJECT_LANGUAGES)[number];
export type ExampleApp = (typeof EXAMPLE_APPS)[number];

const LANGUAGE_COMPATIBILITY: Record<ProjectType, readonly ProjectLanguage[]> =
  {
    'fabric-view': ['kotlin-objc'],
    library: ['js'],
    'nitro-module': ['kotlin-swift'],
    'nitro-view': ['kotlin-swift'],
    'turbo-module': ['kotlin-objc', 'cpp'],
  };

export type GenerateLibraryRequest = {
  createReactNativeLibraryVersion: string;
  name: string;
  slug: string;
  description: string;
  authorName: string;
  authorEmail: string;
  authorUrl: string;
  repoUrl: string;
  type: ProjectType;
  languages: ProjectLanguage;
  example: ExampleApp;
  tools?: string[];
  reactNativeVersion?: string;
};

export type NormalizedGenerateLibraryRequest = {
  createReactNativeLibraryVersion: string;
  name: string;
  slug: string;
  description: string;
  authorName: string;
  authorEmail: string;
  authorUrl: string;
  repoUrl: string;
  type: ProjectType;
  languages: ProjectLanguage;
  example: ExampleApp;
  tools: string[];
};

export type GeneratedFile = {
  path: string;
  size: number;
};

export type GenerateArchiveResult = {
  archiveBase64: string;
  archiveSha256: string;
  archiveSize: number;
  files: GeneratedFile[];
};

export type CachedGeneration = {
  archiveKey: string;
  archivePath: string;
  archiveSha256: string;
  archiveSize: number;
  cacheKey: string;
  fileCount: number;
  files: GeneratedFile[];
  generatedAt: string;
  generatorVersion: string;
  request: NormalizedGenerateLibraryRequest;
};

export function normalizeRequest(
  value: unknown
): NormalizedGenerateLibraryRequest {
  if (!isRecord(value)) {
    throw new Error('Request body must be a JSON object');
  }

  const type = readEnum(value.type, PROJECT_TYPES, 'type');
  const languages = readEnum(value.languages, PROJECT_LANGUAGES, 'languages');

  if (!LANGUAGE_COMPATIBILITY[type].includes(languages)) {
    throw new Error(`languages must be compatible with type "${type}"`);
  }

  return {
    createReactNativeLibraryVersion: readPackageVersion(
      value.createReactNativeLibraryVersion,
      'createReactNativeLibraryVersion'
    ),
    name: readString(value.name, 'name'),
    slug: readString(value.slug, 'slug'),
    description: readString(value.description, 'description'),
    authorName: readString(value.authorName, 'authorName'),
    authorEmail: readEmail(value.authorEmail, 'authorEmail'),
    authorUrl: readUrl(value.authorUrl, 'authorUrl'),
    repoUrl: readUrl(value.repoUrl, 'repoUrl'),
    type,
    languages,
    example: readEnum(value.example, EXAMPLE_APPS, 'example'),
    tools: readTools(value.tools),
  };
}

export async function createCacheKey(
  request: NormalizedGenerateLibraryRequest
): Promise<string> {
  const payload = stableStringify(request);
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(payload)
  );

  return toHex(new Uint8Array(digest));
}

export async function createArchiveSha256(
  archive: Uint8Array
): Promise<string> {
  const bytes = Uint8Array.from(archive);
  const digest = await crypto.subtle.digest('SHA-256', bytes);

  return toHex(new Uint8Array(digest));
}

export function createArchiveKey(cacheKey: string): string {
  return `archives/${cacheKey}.zip`;
}

export function createArchivePath(cacheKey: string): string {
  return `/archives/${cacheKey}.zip`;
}

export function createArchiveFilename(request: {
  name: string;
  slug: string;
}): string {
  const value = request.slug.startsWith('@')
    ? request.slug.slice(1).replace(/\//g, '-')
    : request.slug;

  return `${value || request.name}.zip`;
}

export function buildCliArgs(
  request: NormalizedGenerateLibraryRequest,
  directory: string
): string[] {
  const args = [
    request.name,
    '--directory',
    directory,
    '--slug',
    request.slug,
    '--description',
    request.description,
    '--author-name',
    request.authorName,
    '--author-email',
    request.authorEmail,
    '--author-url',
    request.authorUrl,
    '--repo-url',
    request.repoUrl,
    '--type',
    request.type,
    '--languages',
    request.languages,
    '--example',
    request.example,
  ];

  if (request.tools.length === 0) {
    args.push('--tools=');

    return args;
  }

  for (const tool of request.tools) {
    args.push('--tools', tool);
  }

  return args;
}

export function encodeArchive(archive: Uint8Array): string {
  let binary = '';

  for (const byte of archive) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary);
}

export function decodeArchive(base64: string): Uint8Array {
  const binary = atob(base64);

  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function readString(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${field} must be a non-empty string`);
  }

  return value.trim();
}

function readUrl(value: unknown, field: string): string {
  const url = readString(value, field);

  try {
    new URL(url);
  } catch {
    throw new Error(`${field} must be a valid URL`);
  }

  return url;
}

function readEmail(value: unknown, field: string): string {
  const email = readString(value, field);

  if (!/^\S+@\S+$/.test(email)) {
    throw new Error(`${field} must be a valid email address`);
  }

  return email;
}

function readPackageVersion(value: unknown, field: string): string {
  const version = readString(value, field);

  if (!/^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/.test(version)) {
    throw new Error(`${field} must be an exact package version`);
  }

  return version;
}

function readTools(value: unknown): string[] {
  if (value == null) {
    return [];
  }

  if (!Array.isArray(value)) {
    throw new Error('tools must be an array of strings');
  }

  const tools = value.map((item) => readString(item, 'tools item'));

  return [...new Set(tools)].sort((a, b) => a.localeCompare(b));
}

function readEnum<T extends readonly string[]>(
  value: unknown,
  allowed: T,
  field: string
): T[number] {
  if (typeof value !== 'string' || !allowed.includes(value)) {
    throw new Error(
      `${field} must be one of: ${allowed.map((item) => `"${item}"`).join(', ')}`
    );
  }

  return value;
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(',')}]`;
  }

  if (typeof value === 'object' && value != null) {
    const entries = Object.entries(value).sort(([left], [right]) =>
      left.localeCompare(right)
    );

    return `{${entries.map(([key, item]) => `${JSON.stringify(key)}:${stableStringify(item)}`).join(',')}}`;
  }

  return JSON.stringify(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value != null;
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join(
    ''
  );
}

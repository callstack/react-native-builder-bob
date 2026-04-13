# Server

Small API for generating a library with `create-react-native-library`, caching the result, and returning a `.zip` archive URL.

## Endpoints

- `POST /generate`
- `GET /archives/:cacheKey.zip`
- `GET /health`

`POST /generate` accepts the library parameters, passes `example` through to the CLI, and returns archive metadata plus the generated file list.

Example request:

```json
{
  "createReactNativeLibraryVersion": "0.62.0",
  "name": "MyLibrary",
  "slug": "react-native-my-library",
  "description": "Example library",
  "authorName": "Jane Doe",
  "authorEmail": "jane@example.com",
  "authorUrl": "https://github.com/janedoe",
  "repoUrl": "https://github.com/janedoe/react-native-my-library",
  "type": "library",
  "languages": "js",
  "example": "none",
  "tools": []
}
```

## Local Testing

Install workspace dependencies first:

```sh
yarn install
```

Run both processes:

```sh
yarn workspace server dev
```

If you want to run them separately:

```sh
yarn workspace server dev:worker
yarn workspace server dev:runner
```

Send a request:

```sh
curl -X POST http://127.0.0.1:8787/generate \
  -H 'content-type: application/json' \
  -d '{
    "createReactNativeLibraryVersion": "0.62.0",
    "name": "MyLibrary",
    "slug": "react-native-my-library",
    "description": "Example library",
    "authorName": "Jane Doe",
    "authorEmail": "jane@example.com",
    "authorUrl": "https://github.com/janedoe",
    "repoUrl": "https://github.com/janedoe/react-native-my-library",
    "type": "library",
    "languages": "js",
    "example": "vanilla",
    "tools": ["eslint", "jest", "vite"]
  }'
```

The response includes:

- `archive.url`
- `archive.sha256`
- `archive.size`
- `files`
- `cacheHit`

Download the generated archive with:

```sh
curl -L "$(jq -r '.archive.url' response.json)" -o library.zip
```

## Deploy

This workspace is split into two parts:

- the Cloudflare Worker in `src/index.ts`
- the CLI runner in `src/runner.ts`

Before deploying:

1. Create one `KV` namespace for cache metadata.
2. Create one `R2` bucket for zip archives.
3. Update `server/wrangler.jsonc` with the real `KV` and `R2` IDs.
4. Deploy the runner somewhere that can execute Node, `git`, and `zip`.
5. Set `GENERATOR_ORIGIN` to the runner base URL.

The provided `Dockerfile` builds the runner image:

```sh
docker build -f server/Dockerfile -t create-react-native-library-server .
```

Then deploy the Worker:

```sh
yarn workspace server deploy
```

## Notes

- Cache keys include the normalized request and the `create-react-native-library` version.
- `createReactNativeLibraryVersion` is required and must be an exact published version.
- `example` is required and must be one of `test-app`, `expo`, `vanilla`, or `none`.
- Archives are stored in `R2`; metadata is stored in `KV`.
- The API returns the archive URL and file list, not inline file contents.

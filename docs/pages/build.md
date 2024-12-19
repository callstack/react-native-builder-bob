# Build a React Native library

When code is in non-standard syntaxes such as JSX, TypeScript etc, it needs to be compiled before it can run. Configuring this manually can be error-prone and annoying. `react-native-builder-bob` aims to simplify this process by wrapping `babel` and `tsc` and taking care of the configuration. See [this section](./faq.md#why-should-i-compile-my-project-with-react-native-builder-bob) for a longer explanation.

Supported targets are:

- Generic CommonJS build
- ES modules build for bundlers such as [webpack](https://webpack.js.org)
- [TypeScript](https://www.typescriptlang.org/) definitions
- Flow definitions (copies .js files to .flow files)
- [Codegen](https://reactnative.dev/docs/the-new-architecture/what-is-codegen) generated scaffold code

If you created a project with [`create-react-native-library`](./create.md), `react-native-builder-bob` is **already pre-configured to build your project**. You don't need to configure it again.

The following configuration steps are for projects not created with `create-react-native-library`.

## Automatic configuration

To automatically configure your project to use `react-native-builder-bob`, open a Terminal and run:

```js
npx react-native-builder-bob@latest init
```

This will ask you a few questions and add the required configuration and scripts for building the code. The code will be compiled automatically when the package is published.

> Note: the `init` command doesn't add the `codegen` target yet. You can either add it manually or create a new library with `create-react-native-library`.

You can find details on what exactly it adds in the [Manual configuration](#manual-configuration) section.

## Manual configuration

To configure your project manually, follow these steps:

1. First, install `react-native-builder-bob` in your project. Open a Terminal in your project, and run:

```sh
yarn add --dev react-native-builder-bob
```

1. In your `package.json`, specify the targets to build for:

   ```json
   "react-native-builder-bob": {
     "source": "src",
     "output": "lib",
     "targets": [
       "codegen",
       ["commonjs", { "esm": true }],
       ["module", { "esm": true }],
       ["typescript", { "esm": true }]
     ]
   }
   ```

   See the [Options](#options) section for more details.

1. Add `bob` to your `prepare` or `prepack` step:

   ```js
   "scripts": {
     "prepare": "bob build"
   }
   ```

   Note that there is a difference between `prepare` and `prepack` scripts:

   - `prepare` is run when:
     - The package is published with Yarn 1 (`yarn publish`), npm (`npm publish`) or pnpm (`pnpm publish`)
     - The package is installed from a GIT URL with Yarn 1 (`yarn add <git-url>`), npm (`npm install <git-url>`) or pnpm (`pnpm add <git-url>`)
   - `prepack` is run when:
     - The package is published with any package manager (`yarn publish`, `npm publish`, `pnpm publish`)
     - The package is installed from a GIT URL with Yarn 4 (`yarn add package-name@<git-url>`)

   If you are not sure which one to use, we recommend going with `prepare` as it works during both publishing and installing from GIT with more package managers.

1. Configure the appropriate entry points:

   ```json
   "source": "./src/index.tsx",
   "main": "./lib/commonjs/index.js",
   "module": "./lib/module/index.js",
   "types": "./lib/typescript/commonjs/src/index.d.ts",
   "exports": {
     ".": {
       "import": {
         "types": "./lib/typescript/module/src/index.d.ts",
         "default": "./lib/module/index.js"
       },
       "require": {
         "types": "./lib/typescript/commonjs/src/index.d.ts",
         "default": "./lib/commonjs/index.js"
       }
     }
   },
   "files": [
     "lib",
     "src"
   ]
   ```

   Here is what each of these fields mean:

   - `source`: The path to the source code. It is used by `react-native-builder-bob` to detect the correct output files and provide better error messages.
   - `main`: The entry point for the CommonJS build. This is used by Node - such as tests, SSR etc.
   - `module`: The entry point for the ES module build. This is used by bundlers such as webpack.
   - `types`: The entry point for the TypeScript definitions. This is used by TypeScript to typecheck the code using your library.
   - `files`: The files to include in the package when publishing with `npm`.
   - `exports`: The entry points for tools that support the `exports` field in `package.json` - such as Node.js 12+ & modern browsers. See [the ESM support guide](./esm.md) for more details.

   Make sure to change specify correct files according to the targets you have enabled.

   > If you're building TypeScript definition files, also make sure that the `types` field points to a correct path. Depending on the project configuration, the path can be different for you than the example snippet (e.g. `lib/typescript/index.d.ts` if you have only the `src` directory and `rootDir` is not set).

1. Add the output directory to `.gitignore` and `.eslintignore`

   ```gitignore
   # generated files by bob
   lib/
   ```

   This makes sure that you don't accidentally commit the generated files to git or get lint errors for them.

1. Add the output directory to `jest.modulePathIgnorePatterns` if you use [Jest](https://jestjs.io)

   ```json
   "modulePathIgnorePatterns": ["<rootDir>/lib/"]
   ```

   This makes sure that Jest doesn't try to run the tests in the generated files.

1. Configure [React Native Codegen](https://reactnative.dev/docs/the-new-architecture/what-is-codegen)

   If your library is supporting the [New React Native Architecture](https://reactnative.dev/architecture/landing-page), you should also configure Codegen. This is not required for libraries that are only supporting the old architecture.

   You can follow the [Official Codegen Setup Guide](https://reactnative.dev/docs/the-new-architecture/using-codegen) to enable Codegen.

   It's also recommended to ship your Codegen generated scaffold code with your library since it has numerous benefits. To see the benefits and implement this behavior, you can see the [Official Codegen Shipping Guide](https://reactnative.dev/docs/the-new-architecture/codegen-cli#including-generated-code-into-libraries).

   > Note: If you enable Codegen generated code shipping, React Native won't build the scaffold code automatically when you build your test app. You need to rebuild the codegen scaffold code manually each time you make changes to your spec. If you want to automate this process, you can create a new project with `create-react-native-library` and inspect the example app.

   ##### Opting out of Codegen shipping __(not recommended)__

   If you have a reason to not ship Codegen generated scaffold code with your library, you need to remove the [codegen target](#codegen) and add `package.json` to your `exports` field. Otherwise, React Native Codegen will skip spec generation for your library when your library is consumed as an NPM library. You can find the related issue [here](https://github.com/callstack/react-native-builder-bob/issues/637).

   ```json
   "exports": {
     // ...
     "./package.json": "./package.json"
   },
   ```

And we're done 🎉

## Options

The options can be specified in the `package.json` file under the `react-native-builder-bob` property, or in a `bob.config.js` file in your project directory.

### `source`

The name of the folder with the source code which should be compiled. The folder should include an `index` file.

### `output`

The name of the folder where the compiled files should be output to. It will contain separate folder for each target.

### `exclude`

Glob pattern to be used while filtering the unnecessary files. Defaults to `'**/{__tests__,__fixtures__,__mocks__}/**'` if not specified.

Example:

```json
{
  "exclude": "ignore_me/**"
}
```

> This option only works with `commonjs` and `module` targets. To exclude files while building `typescript`, please see [the tsconfig exclude field](https://www.typescriptlang.org/tsconfig#exclude).

### `targets`

Various targets to build for. The available targets are:

#### `codegen`

Generates the [React Native Codegen](https://reactnative.dev/docs/the-new-architecture/what-is-codegen) scaffold code, which is used with the New React Native Architecture.

You can ensure your Codegen generated scaffold code is stable through different React Native versions by shipping it with your library. You can find more in the [React Native Official Docs](https://reactnative.dev/docs/the-new-architecture/codegen-cli#including-generated-code-into-libraries).

#### `custom`

Define a custom build target. This is useful to call code generators during the build process.

##### `script`

`bob` will run the script passed in the `script` option. The build process **will throw and exit** if the `build` target is defined without this option.

##### `cwd`

You can set the `cwd` (current working directory) option to specify where the command should be called from. This option accepts **a relative path**, and it will default to the path `build` was called from.

##### `clean`

You can pass a path to this option and `bob` will delete all the files on that path. The path is resolved relatively to the `cwd` option.

#### `commonjs`

Enable compiling source files with Babel and use CommonJS module system.

This is useful for running the code in Node (SSR, tests etc.). The output file should be referenced in the `main` field and `exports['.'].require` (when `esm: true`) field of `package.json`.

By default, the code is compiled to support the last 2 versions of modern browsers. It also strips TypeScript and Flow annotations as well as compiles JSX. You can customize the environments to compile for by using a [browserslist config](https://github.com/browserslist/browserslist#config-file).

In addition, the following options are supported:

##### `esm`

Setting this option to `true` will output ES modules compatible code for Node.js 12+, modern browsers and other tools that support `package.json`'s `exports` field.

See the [ESM support](./esm.md) guide for more details.

##### `configFile`

To customize the babel config used, you can pass the [`configFile`](https://babeljs.io/docs/en/options#configfile) option as `true` if you have a `babel.config.js` or a path to a custom config file. This will override the default configuration. You can extend the default configuration by using the [`react-native-builder-bob/babel-preset`](https://github.com/callstack/react-native-builder-bob/blob/main/packages/react-native-builder-bob/babel-preset.js) preset.

##### `babelrc`

You can set the [`babelrc`](https://babeljs.io/docs/en/options#babelrc) option to `true` to enable using `.babelrc` files.

##### `copyFlow`

If your source code is written in [Flow](http://www.typescriptlang.org/), You can specify the `copyFlow` option to `true` to copy the source files as `.js.flow` to the output folder. If the `main` entry in `package.json` points to the `index` file in the output folder, the flow type checker will pick these files up to use for type definitions.

##### `sourceMaps`

Sourcemaps are generated by default alongside the compiled files. You can disable them by setting the `sourceMaps` option to `false`.

Example:

```json
["commonjs", { "esm": true, "copyFlow": true }]
```

#### `module`

Enable compiling source files with Babel and use ES module system. This is essentially the same as the `commonjs` target and accepts the same options, but leaves the `import`/`export` statements in your code.

This is useful for bundlers that understand ES modules and can tree-shake. The output file should be referenced in the `module` field and `exports['.'].import` (when `esm: true`) field of `package.json`.

Example:

```json
["module", { "esm": true, "sourceMaps": false }]
```

##### `jsxRuntime`

Explicitly set your [runtime](https://babeljs.io/docs/babel-preset-react#runtime). Defaults to `automatic`.

#### `typescript`

Enable generating type definitions with `tsc` if your source code is written in [TypeScript](http://www.typescriptlang.org/).

The following options are supported:

##### `project`

By default, the `tsconfig.json` file in the root of your project is used to generate the type definitions. You can specify a path to a different config by using the `project` option. This can be useful if you need to use different configs for development and production.

##### `tsc`

The path to the `tsc` binary is automatically detected and defaults to the one installed in your project. You can use the `tsc` option to specify a different path.

Example:

```json
["typescript", { "project": "tsconfig.build.json" }]
```

The output file should be referenced in the `types` field or `exports['.'].types` field of `package.json`.

##### `esm`

Setting this option to `true` will output 2 sets of type definitions: one for the CommonJS build and one for the ES module build.

See the [ESM support](./esm.md) guide for more details.

## Commands

The `bob` CLI exposes the following commands:

### `init`

This configures an existing project to use `bob` by adding the required configuration and dependencies. This is usually run with `npx`:

```sh
npx react-native-builder-bob@latest init
```

### `build`

This builds the project according to the configuration. This is usually run as part of the package's publishing flow, i.e. in the `prepare` or `prepack` scripts.

```json
"scripts": {
  "prepare": "bob build"
}
```

![Demo](../assets/react-native-builder-bob.svg)

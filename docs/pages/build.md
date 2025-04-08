# Build a React Native library

When code is in non-standard syntaxes such as JSX, TypeScript etc, it needs to be compiled before it can run. Configuring this manually can be error-prone and annoying. `react-native-builder-bob` aims to simplify this process by wrapping `babel` and `tsc` and taking care of the configuration. See [this section](./faq.md#why-should-i-compile-my-project-with-react-native-builder-bob) for a longer explanation.

Supported targets are:

- [ES modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) build for modern tools
- [CommonJS](https://nodejs.org/api/modules.html#modules-commonjs-modules) build for legacy tools
- [TypeScript](https://www.typescriptlang.org/) definitions
- [Flow](https://flow.org/) definitions (copies .js files to .flow files)
- [Codegen](https://reactnative.dev/docs/the-new-architecture/what-is-codegen) generated scaffold code

If you created a project with [`create-react-native-library`](./create.md), `react-native-builder-bob` is **already pre-configured to build your project**. You don't need to configure it again.

The following configuration steps are for projects not created with `create-react-native-library`.

## Automatic configuration

To automatically configure your project to use `react-native-builder-bob`, open a Terminal and run:

```js
npx react-native-builder-bob@latest init
```

This will ask you a few questions and add the required configuration and scripts for building the code. The code will be compiled automatically when the package is published.

> Note: the `init` command doesn't add the [`codegen` target](#codegen) yet. You can either add it manually or create a new library with `create-react-native-library`.

You can find details on what exactly it adds in the [Manual configuration](#manual-configuration) section.

## Manual configuration

To configure your project manually, follow these steps:

1. First, install `react-native-builder-bob` in your project. Open a Terminal in your project, and run:

   ```sh
   yarn add --dev react-native-builder-bob
   ```

2. In your `package.json`, specify the targets to build for:

   ```json
   "react-native-builder-bob": {
     "source": "src",
     "output": "lib",
     "targets": [
       ["module", { "esm": true }],
       ["commonjs", { "esm": true }],
       "typescript",
       "codegen"
     ]
   }
   ```

   See the [Options](#options) section for more details.

3. Add `bob` to your `prepare` or `prepack` step:

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

4. Configure the appropriate entry points:

   ```json
   "source": "./src/index.tsx",
   "main": "./lib/module/index.js",
   "types": "./lib/typescript/src/index.d.ts",
   "exports": {
     ".": {
        "types": "./lib/typescript/src/index.d.ts",
        "default": "./lib/module/index.js"
     },
     "./package.json": "./package.json"
   },
   "files": [
     "lib",
     "src"
   ]
   ```

   Here is what each of these fields mean:

   - `source`: The path to the source code. It is used by `react-native-builder-bob` to detect the correct output files and provide better error messages.
   - `main`: The entry point for legacy setups that don't support the `exports` field. See [Compatibility](./esm.md#compatibility) for more details.
   - `types`: The entry point for the TypeScript definitions for legacy setups with `moduleResolution: node10` or `moduleResolution: node`.
   - `exports`: The entry points for tools that support the `exports` field in `package.json` - such as Node.js 12+, modern browsers and tools. See [the ESM support guide](./esm.md) for more details.
   - `files`: The files to include in the package when publishing with `npm`.

   Make sure to change specify correct files according to the targets you have enabled.

5. Add the output directory to `.gitignore` and `.eslintignore`

   ```gitignore
   # generated files by bob
   lib/
   ```

   This makes sure that you don't accidentally commit the generated files to git or get lint errors for them.

6. Add the output directory to `jest.modulePathIgnorePatterns` if you use [Jest](https://jestjs.io)

   ```json
   "modulePathIgnorePatterns": ["<rootDir>/lib/"]
   ```

   This makes sure that Jest doesn't try to run the tests in the generated files.

7. Configure [React Native Codegen](https://reactnative.dev/docs/the-new-architecture/what-is-codegen)

   If your library supports the [New React Native Architecture](https://reactnative.dev/architecture/landing-page), you should also configure Codegen. This is not required for libraries that only support the old architecture.

   You can follow the [Official Codegen Setup Guide](https://reactnative.dev/docs/the-new-architecture/using-codegen) to enable Codegen.

   It's also recommended to ship your Codegen generated scaffold code with your library since it has numerous benefits. To see the benefits and implement this behavior, you can see the [Official Codegen Shipping Guide](https://reactnative.dev/docs/the-new-architecture/codegen-cli#including-generated-code-into-libraries).

   See [How to opt-out of shipping the Codegen generated code](./faq.md#how-to-opt-out-of-shipping-codegen-generated-scaffold-code) if you don't want to ship the Codegen generated scaffold code.

   > Note: If you enable Codegen generated code shipping, React Native won't build the scaffold code automatically when you build your test app. You need to rebuild the codegen scaffold code manually each time you make changes to your spec. If you want to automate this process, you can create a new project with `create-react-native-library` and inspect the example app.

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

#### `module`

Enable compiling source files with Babel and use ES module system (`import`/`export`).

This is useful for modern bundlers that understand ES modules. Bundlers such as [webpack](https://webpack.js.org) can also tree-shake code using ES modules.

The output file should be referenced in the `module` field and `exports['.'].import` (when `esm: true`) field of `package.json`.

By default, the code is compiled to support the last 2 versions of modern browsers. It also strips TypeScript and Flow annotations as well as compiles JSX code. You can customize the environments to compile for by using a [browserslist config](https://github.com/browserslist/browserslist#config-file).

In addition, the following options are supported:

##### `esm`

Setting this option to `true` will output ES modules compatible code for Node.js 12+, modern browsers and tools that support `package.json`'s `exports` field.

See the [ESM support](./esm.md) guide for more details.

##### `configFile`

To customize the babel config used, you can pass the [`configFile`](https://babeljs.io/docs/en/options#configfile) option as `true` if you have a `babel.config.js` or a path to a custom config file. This will override the default configuration.

It is recommended that you extend the default configuration by using the [`react-native-builder-bob/babel-preset`](https://github.com/callstack/react-native-builder-bob/blob/main/packages/react-native-builder-bob/babel-preset.js) preset in your custom config file:

```js
module.exports = {
  presets: ['react-native-builder-bob/babel-preset'],
};
```

This will make sure that the `commonjs` target produces code using CommonJS and the `module` target produces code using ES modules. It is also necessary for the `esm` option to work correctly.

If you don't want to use the preset, then make sure to conditionally enable or disable the CommonJS transform with the following condition:

```js
module.exports = (api) => {
  const isCommonJSTransformDisabled = api.caller(
    // If `supportsStaticESM` is `true`, output ES modules, otherwise output CommonJS
    (caller) => caller && caller.supportsStaticESM
  );

  return {
    // Your config here
  };
};
```

If you're using [`@babel/preset-env`](https://babeljs.io/docs/babel-preset-env) with the [`modules`](https://babeljs.io/docs/babel-preset-env#modules) option set to `"auto"` (which is the default), it will be automatically configured to correctly enable the CommonJS transform when needed, so additional configuration is not necessary.

##### `babelrc`

You can set the [`babelrc`](https://babeljs.io/docs/en/options#babelrc) option to `true` to enable using `.babelrc` files. Similar considerations apply as with the `configFile` option.

##### `jsxRuntime`

By default, JSX is compiled to use the `automatic` [runtime](https://babeljs.io/docs/babel-preset-react#runtime) [introduced in React 17](https://legacy.reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html). This transform is also compatible with React 16.14.0, React 15.7.0, and React 0.14.10.

If you want to use the classic runtime for any other reason, you can set the `jsxRuntime` option to `classic` explicitly.

This option has no effect when overriding the default babel configuration without using `react-native-builder-bob/babel-preset`.

##### `copyFlow`

If your source code is written in [Flow](http://www.typescriptlang.org/), You can specify the `copyFlow` option to `true` to copy the source files as `.js.flow` to the output folder. If the `main` entry in `package.json` points to the `index` file in the output folder, the flow type checker will pick these files up to use for type definitions.

##### `sourceMaps`

Sourcemaps are generated by default alongside the compiled files. You can disable them by setting the `sourceMaps` option to `false`.

Example:

```json
["module", { "esm": true }]
```

#### `commonjs`

Enable compiling source files with Babel and use CommonJS module system. This is essentially the same as the `module` target and accepts the same options, but transforms the `import`/`export` statements in your code to `require`/`module.exports`.

This is useful for supporting tools that don't support ES modules yet, see [the Compatibility section in our ESM guide](./esm.md#compatibility) for more details.

The output file should be referenced in the `main` field. If you have a [dual package setup](esm.md#dual-package-setup) with both ESM and CommonJS builds, it needs to be specified in `exports['.'].require` field of `package.json`.

Example:

```json
["commonjs", { "sourceMaps": false, "copyFlow": true }]
```

#### `typescript`

Enable generating type definitions with `tsc` if your source code is written in [TypeScript](http://www.typescriptlang.org/).

When both `module` and `commonjs` targets are enabled, and `esm` is set to `true` for the `module` target, this will output 2 sets of type definitions: one for the CommonJS build and one for the ES module build.

The following options are supported:

##### `project`

By default, the `tsconfig.json` file in the root of your project is used to generate the type definitions. You can specify a path to a different config by using the `project` option. This can be useful if you need to use different configs for development and production.

##### `tsc`

The path to the `tsc` binary is automatically detected and defaults to the one installed in your project. You can use the `tsc` option to specify a different path.

Example:

```json
["typescript", { "project": "tsconfig.build.json" }]
```

The output file should be referenced in the `exports['.'].types` field of `package.json`.

If you need to support legacy setups that use `moduleResolution: node10` or `moduleResolution: node`, you can also add a `types` field to the `package.json` file that points to the output file.

#### `codegen`

Enable generating the [React Native Codegen](https://reactnative.dev/docs/the-new-architecture/what-is-codegen) scaffold code, which is used with the New React Native Architecture.

You can ensure your Codegen generated scaffold code is stable through different React Native versions by shipping it with your library. You can find more in the [React Native Official Docs](https://reactnative.dev/docs/the-new-architecture/codegen-cli#including-generated-code-into-libraries).

#### `custom`

Define a custom build target. This is useful to call custom scripts during when running `bob build`.

##### `script`

Name of the script to run. The script must be defined in the `package.json` file under the `scripts` property. This property is required.

This script is run asynchronously alongside the other build targets.

##### `clean`

Optionally, you can specify a path to cleanup before running the build script. The path is resolved relatively to where `build` was called from.

This is useful if your script generates output files. Cleaning the output folder before running the script ensures that the output doesn't contain stale files.

Example:

```json
["custom", { "script": "my-custom-build", "clean": "my-output-folder/" }]
```

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

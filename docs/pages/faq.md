# Frequently Asked Questions

## Why should I compile my project with `react-native-builder-bob`?

We often write our library code in non-standard syntaxes such as JSX, TypeScript etc. as well as proposed syntaxes which aren't part of the standard yet. This means that our code needs to be compiled to be able to run on JavaScript engines.

When using the library in a React Native app, Metro handles compiling the source code. However, it's also possible to use them in other targets such as:

- Browsers or bundlers such as [webpack](https://webpack.js.org) (if we support Web)
- [Node.js](https://nodejs.org) for tests or SSR etc.

So the code needs to be precompiled so these tools can parse it. In addition, we need to generate type definition files for [TypeScript](https://www.typescriptlang.org/) etc.

To handle such multiple targets, one solution could is to have multiple babel configs (or TypeScript configs) and have a `babel-cli` command in our `package.json` for compilation. Ideally, we should also keep the configs in sync between our several projects.

As an example, this is a command that we had in one of the packages:

```sh
babel --extensions '.js,.ts,.tsx' --no-babelrc --config-file=./babel.config.publish.js src --ignore '**/__tests__/**' --copy-files --source-maps --delete-dir-on-start --out-dir dist && del-cli 'dist/**/__tests__' && yarn tsc --emitDeclarationOnly
```

As you can see, it's quite long and hard to read. There's even a separate `babel.config.publish.js` file. And this only works for webpack and Metro, and will fail on Node due to ESM usage.

`react-native-builder-bob` wraps tools such as `babel` and `typescript` to simplify these common tasks across multiple projects. While it can be used for any library, it's primarily tailored to React Native projects to minimize the configuration required.

## How do I add a react-native library containing native code as a dependency in my library?

If your library depends on another react-native library containing native code, you should do the following:

- **Add the native library to `peerDependencies`**

  This means that the consumer of the library will need to install the native library and add it to the `dependencies` section of their `package.json`. It makes sure that:

  - There are no version conflicts if another package also happens to use the same library, or if the user wants to use the library in their app. While there can be multiple versions of a JavaScript-only library, there can only be one version of a native library - so avoiding version conflicts is important.
  - The package manager installs it in correct location so that autolinking can work properly.

  Don't add the native library to `dependencies` of your library, otherwise it may cause issues for the user even if it seems to work.

- **Add the native library to `devDependencies`**

  This makes sure that you can use it for tests, and there are no other errors such as type errors due to the missing module.

- **Add the native library to `dependencies` in the `package.json` under `example`**

  This is equivalent to the consumer of the library installing the dependency, and is needed so that this module is also available to the example app.

## How to upgrade the `react-native` version in the generated project?

Since this is a library, the `react-native` version specified in the `package.json` is not relevant for the consumers. It's only used for developing and testing the library. If you'd like to upgrade the `react-native` version to test with it, you'd need to:

1. **Bump versions of the following packages under `devDependencies` in the `package.json`:**

   - `react-native`
   - `react`
   - `@types/react`
   - `@types/react-native`

   If you have any other related packages such as `react-test-renderer`, make sure to bump them as well.

2. **Upgrade `react-native` in the `example` app**

   The example app is a React Native app that can be updated following the same process as a regular React Native app. The process will vary depending on if it's using [Expo](https://expo.io) or [React Native CLI](https://github.com/react-native-community/cli). See the [official upgrade guide](https://reactnative.dev/docs/upgrading) for more details.

To avoid issues, make sure that the versions of `react` and `react-native` are the same in `example/package.json` and the `package.json` at the root.

## How does the library get linked to the example app in the generated project?

If you generate a project with `create-react-native-library`, you get an example app to test your library. It's good to understand how the library gets linked to the example app in case you want to tweak how it works or if you run into issues.

There are 2 parts to this process.

1. **Aliasing the JavaScript code**

   The JavaScript (or TypeScript) source code is aliased to be used by the example app. This makes it so that when you import from `'your-library-name'`, it imports the source code directly and avoids having to rebuild the library for JavaScript only changes. We configure several tools to make this work:

   - [Babel](https://babeljs.io) is configured to use the alias in `example/babel.config.js` using [babel-plugin-module-resolver](https://github.com/tleunen/babel-plugin-module-resolver). This transforms the imports to point to the source code instead.
   - [Metro](https://facebook.github.io/metro/) is configured to allow importing from outside of the `example` directory by configuring `watchFolders`, and to use the appropriate peer dependencies. This configuration exists in the `example/metro.config.js` file.
   - [Webpack](https://webpack.js.org/) is configured to compile the library source code when running on the Web. This configuration exists in the `example/webpack.config.js` file.
   - [TypeScript](https://www.typescriptlang.org/) is configured to use the source code for type checking by using the `paths` property under `compilerOptions`. This configuration exists in the `tsconfig.json` file at the root.

2. **Linking the native code**

   By default, React Native CLI only links the modules installed under `node_module` of the app. To be able to link the `android` and `ios` folders from the project root, the path is specified in the `example/react-native.config.js` file.

## How to test the library in an app locally?

You may have come across the `yarn link` and `npm link` commands, or used `npm install ../path/to/folder` or `yarn add ../path/to/folder` to test libraries locally. These commands may work for simple packages without build process, but they have different behavior from how a published package works, e.g. `.npmignore` is not respected, the structure of `node_modules` is different, etc. So we don't recommended using these approaches to test libraries locally.

For more accurate testing, there are various other approaches:

1. **Local tarball with `npm`**

   First, temporarily change the version in `package.json` to something like `0.0.0-local.0`. This version number needs to be updated to something different every time you do this to avoid [stale content](https://github.com/yarnpkg/yarn/issues/6811).

   Run the following command inside your library's root:

   ```sh
   npm pack
   ```

   This will generate a file like `your-library-name-0.0.0-local.0.tgz` in the root of the project.

   Then, you can install the tarball in your app:

   ```sh
   yarn add ../path/to/your-library-name-0.0.0-local.0.tgz
   ```

   Or if you use `npm`:

   ```sh
   npm install ../path/to/your-library-name-0.0.0-local.0.tgz
   ```

2. **Yalc**

   [Yalc](https://github.com/wclr/yalc) acts as a local repository for packages that can be used to test packages locally. It's similar to the previous workflow, but more convenient to use.

   You can find installation and usage instructions in the [Yalc documentation](https://github.com/wclr/yalc#installation).

3. **Verdaccio**

   [Verdaccio](https://verdaccio.org/) is a lightweight private npm registry that can be used to test packages locally. The advantage of using Verdaccio is that it allows to test the complete workflow of publishing and installing a package without actually publishing it to a remote registry.

   You can find installation and usage instructions in the [Verdaccio documentation](https://verdaccio.org/docs/en/installation).

## Users get a warning when they install my library

If users are using Yarn 1, they may get a warning when installing your library:

```sh
warning Workspaces can only be enabled in private projects.
```

This is because the example app is configured as a Yarn workspace, and there is a [bug in Yarn 1](https://github.com/yarnpkg/yarn/issues/8580) which causes this warning to be shown for third-party packages. It has no impact for the consumers of the library and the warning can be ignored. If consumers would like to get rid of the warning, there are 2 options:

1. **Disable workspaces**

   If the consumer doesn't use Yarn workspaces, they can disable it by adding the following to the `.yarnrc` file in the root of their project:

   ```rc
   workspaces-experimental false
   ```

2. **Upgrade to Yarn 3**

   Yarn 1 is no longer maintained, so it's recommended to upgrade to Yarn 3. Yarn 3 works with React Native projects with the `node-modules` linker. To upgrade, consumers can follow the [official upgrade guide](https://yarnpkg.com/migration/guide).

   It's also necessary to use `node-modules` linker. To use it, consumers can add the following to the `.yarnrc.yml` file in the root of their project:

   ```yml
   nodeLinker: node-modules
   ```



## Testing with React Native testing library

To test with React Native testing library, you may need to use `@react-native/babel-preset` preset for test environment in `babel.config.js` file.

```js
// babel.config.js
module.exports = {
  presets: ['module:react-native-builder-bob/babel-preset'],
  env: {
    test: {
      presets: ['module:@react-native/babel-preset'],
    },
  },
};
```
Then update the jest config in your `package.json` file.

```json
// package.json
"jest": {
    "preset": "react-native",
    "modulePathIgnorePatterns": [
      "<rootDir>/example/node_modules",
      "<rootDir>/lib/"
    ],
    "transformIgnorePatterns": [
      "node_modules/(?!(jest-)?react-native|@react-native|@react-native-community|react-native-reanimated)"
    ],
    "setupFilesAfterEnv": [
      "@testing-library/react-native/extend-expect"
    ]
  },
```

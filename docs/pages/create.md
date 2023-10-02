# Scaffold a React Native library

If you want to create your own React Native library, scaffolding the project can be a daunting task. `create-react-native-library` can scaffold a new project for you with all the necessary tools configured.

## Features

- Minimal boilerplate for libraries on which you can build upon
- Example React Native app to test your library code
- [TypeScript](https://www.typescriptlang.org/) to ensure type-safe code and better DX
- Support for [Turbo Modules](https://reactnative.dev/docs/next/the-new-architecture/pillars-turbomodules) & [Fabric](https://reactnative.dev/docs/next/the-new-architecture/pillars-fabric-components)
- Support for [Kotlin](https://kotlinlang.org/) on Android & [Swift](https://developer.apple.com/swift/) on iOS
- Support for C++ to write cross-platform native code
- [Expo](https://expo.io/) for libraries without native code and web support
- [ESLint](https://eslint.org/), [Prettier](https://prettier.io/), [TypeScript](https://www.typescriptlang.org/), [Lefthook](https://github.com/evilmartians/lefthook) and [Release It](https://github.com/release-it/release-it) pre-configured
- [`react-native-builder-bob`](./build.md) pre-configured to compile your files
- [GitHub Actions](https://github.com/features/actions) pre-configured to run tests and lint on the CI

## Usage

To create new project, run the following:

```sh
npx create-react-native-library@latest awesome-library
```

This will ask you a few questions about your project and generate a new project in a folder named `awesome-library`.

![Demo](../assets/create-react-native-library.gif)

After the project is created, you can find the development workflow in the generated `CONTRIBUTING.md` file.

## Local library

While the default templates are for libraries that are published to npm, you can also create a local library that is not published, but used locally in your app. The local library is created outside of the `android` and `ios` folders and makes use of autolinking to integrate with your app. It also doesn't include a separate example app and additional dependencies that are configured in the default templates. This is an alternative approach to the setup mentioned in [React Native docs](https://reactnative.dev).

If you run `create-react-native-library` in an existing project containing a `package.json`, it'll be automatically detected and you'll be asked if you want to create a local library. You can also pass the `--local` flag to the command to explicitly create a local library:

```sh
npx create-react-native-library@latest awesome-library --local
```

The advantages of this approach are:

- It's easier to upgrade React Native as you don't need to worry about custom code in `android` and `ios` folders.
- It can be used with [Expo](https://expo.io/) managed projects with custom development client.
- It's easier to copy the library to other projects or publish later if needed.
- The boilerplate for the library doesn't need to be written from scratch.
- It can be used with monorepos where the additional tooling in the default templates may not be needed.

By default, the generated library is automatically linked to the project using `link:` protocol when using [Yarn](https://yarnpkg.com/) and `file:` when using [npm](https://docs.npmjs.com/cli):

```json
"dependencies": {
  "react-native-awesome-library": "link:./modules/awesome-library"
}
```

This creates a symlink to the library under `node_modules` which makes autolinking work. But if you're using a monorepo or have non-standard setup, you'll need to manually set up the package to be linked to your app based on your project setup.

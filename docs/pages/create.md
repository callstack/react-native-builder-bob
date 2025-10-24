---
title: Scaffold a React Native library
---

If you want to create your own React Native library, scaffolding the project can be a daunting task. `create-react-native-library` can scaffold a new project for you with all the necessary tools configured.

## Features

- Minimal boilerplate for libraries on which you can build upon
- Example React Native app to test your library code
- [TypeScript](https://www.typescriptlang.org/) to ensure type-safe code and better DX
- Support for [Turbo Modules](https://reactnative.dev/docs/turbo-native-modules-introduction) & [Fabric](https://reactnative.dev/docs/fabric-native-components-introduction)
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

![Demo](../assets/create-react-native-library.svg)

After the project is created, you can find the development workflow in the generated `CONTRIBUTING.md` file.

> Note: If you want to create a library using the legacy native modules and view APIs instead of the new architecture, you can use the `0.49.8` version of `create-react-native-library`: `npx create-react-native-library@0.49.8 awesome-library`.

## Local library

While the default templates are for libraries that are published to npm, you can also create a local library that is not published but used locally in your app.

You'd typically use a local library when:

- You're building a native library for your app and don't want to publish it to npm.
- You want to be able to easily copy the library to other projects.
- You're in a monorepo and want to keep the library code in the same repository as the app.
- You're using Expo, but want to use vanilla React Native API for native modules and components.

The structure of the app with a local library may look like this:

```sh
MyApp
├── node_modules
├── modules              <-- folder for your local libraries
│   └── awesome-library  <-- your local library
├── android
├── ios
├── src
├── index.js
└── package.json
```

If you run `create-react-native-library` in an existing project containing a `package.json`, it'll be automatically detected and you'll be asked if you want to create a local library. You can also pass the `--local` flag to the command to explicitly create a local library:

```sh
npx create-react-native-library@latest awesome-library --local
```

The local library is created outside of the `android` and `ios` folders and makes use of autolinking to integrate with your app. It also doesn't include a separate example app and additional dependencies that are configured in the default templates. This is an alternative approach to the setup mentioned in [React Native docs](https://reactnative.dev).

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

## Writing native code

Once the project is created, you can follow the official React Native docs to learn the API for writing native modules and components:

- [Native Modules](https://reactnative.dev/docs/legacy/native-modules-intro)
- [Native UI Components for Android](https://reactnative.dev/docs/legacy/native-components-android)
- [Native UI Components for iOS](https://reactnative.dev/docs/legacy/native-components-ios)
- [Turbo Modules](https://reactnative.dev/docs/turbo-native-modules-introduction)
- [Fabric Components](https://reactnative.dev/docs/fabric-native-components-introduction)

# Bob

[![create-react-native-library][create-react-native-library-version-badge]][create-react-native-library]
[![react-native-builder-bob][react-native-builder-bob-version-badge]][react-native-builder-bob]
[![MIT License][license-badge]][license]

👷‍♂️ Set of CLIs to scaffold and build React Native libraries for different targets.

## Documentation

Documentation is available at [https://callstack.github.io/react-native-builder-bob/](https://callstack.github.io/react-native-builder-bob/).

## Development workflow

This project uses a monorepo using `yarn`. To setup the project, run `yarn` in the root directory to install the required dependencies.

```sh
yarn
```

While developing, you can run watch mode to automatically rebuild the changes:

```sh
yarn watch
```

To test the CLI locally, you can point to the appropriate executable:

```sh
../bob/packages/create-react-native-library/bin/create-react-native-library
```

Before sending a pull request, make sure your code passes TypeScript and ESLint. Run the following to verify:

```sh
yarn typecheck
yarn lint
```

To fix formatting errors, run the following:

```sh
yarn lint --fix
```

The documentation for the project is under `docs` directory. To run the documentation locally, run the following:

```sh
yarn docs dev
```

## Publishing

Maintainers with write access to the GitHub repo and the npm organization can publish new versions. To publish a new version, first, you need to export a `GH_TOKEN` environment variable as mentioned [here](https://github.com/lerna-lite/lerna-lite/blob/main/packages/version/README.md#remote-client-auth-tokens). Then run:

```sh
yarn lerna publish
```

This will automatically bump the version and publish the packages. It'll also publish the changelogs on GitHub for each package.

When releasing a pre-release version, we need to:

- Update `lerna.json` to set the `preId` (e.g. `next`) and `preDistTag` (e.g. `next`) fields, and potentially the `allowBranch` field.
- Run the following command:

```sh
yarn lerna publish --conventional-commits --conventional-prerelease --preid next
```

When releasing a stable version, we need to:

- Remove the `preId` and `preDistTag` fields from `lerna.json`.
- Run the following command:

```sh
yarn lerna publish --conventional-commits --conventional-graduate
```

## Acknowledgments

Thanks to the authors of these libraries for inspiration:

- [create-react-native-module](https://github.com/brodybits/create-react-native-module)
- [react-native-webview](https://github.com/react-native-community/react-native-webview)
- [RNNewArchitectureLibraries](https://github.com/react-native-community/RNNewArchitectureLibraries)

## Alternatives

Some other tools for building React Native libraries that you may want to check out:

- [create-expo-module](https://docs.expo.dev/modules/get-started/)
- [react-native-module-init](https://github.com/brodybits/react-native-module-init) (Unmaintained)

## LICENSE

MIT

<!-- badges -->

[create-react-native-library-version-badge]: https://img.shields.io/npm/v/create-react-native-library?label=create-react-native-library&style=flat-square
[react-native-builder-bob-version-badge]: https://img.shields.io/npm/v/react-native-builder-bob?label=react-native-builder-bob&style=flat-square
[create-react-native-library]: https://www.npmjs.com/package/create-react-native-library
[react-native-builder-bob]: https://www.npmjs.com/package/react-native-builder-bob
[license-badge]: https://img.shields.io/npm/l/react-native-builder-bob.svg?style=flat-square
[license]: https://opensource.org/licenses/MIT

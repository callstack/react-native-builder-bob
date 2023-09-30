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

## Acknowledgements

Thanks to the authors of these libraries for inspiration:

- [create-react-native-module](https://github.com/brodybits/create-react-native-module)
- [react-native-webview](https://github.com/react-native-community/react-native-webview)
- [RNNewArchitectureLibraries](https://github.com/react-native-community/RNNewArchitectureLibraries)

## Alternatives

There are other similar tools to scaffold React Native libraries. The difference is that the generated project with `create-react-native-library` is very opinionated and configured with additional tools.

- [react-native-module-init](https://github.com/brodybits/react-native-module-init)

## LICENSE

MIT

<!-- badges -->

[create-react-native-library-version-badge]: https://img.shields.io/npm/v/create-react-native-library?label=create-react-native-library&style=flat-square
[react-native-builder-bob-version-badge]: https://img.shields.io/npm/v/react-native-builder-bob?label=react-native-builder-bob&style=flat-square
[create-react-native-library]: https://www.npmjs.com/package/create-react-native-library
[react-native-builder-bob]: https://www.npmjs.com/package/react-native-builder-bob
[license-badge]: https://img.shields.io/npm/l/react-native-builder-bob.svg?style=flat-square
[license]: https://opensource.org/licenses/MIT

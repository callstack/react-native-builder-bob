# ESM support

Libraries created with [`create-react-native-library`](./create.md) are pre-configured to work with ESM (ECMAScript Modules) out of the box.

You can verify whether ESM support is enabled by checking the configuration for [`react-native-builder-bob`](./build.md) in the `package.json` file of the library:

```json
"react-native-builder-bob": {
  "source": "src",
  "output": "lib",
  "targets": [
    ["module", { "esm": true }],
    ["commonjs", { "esm": true }],
    "typescript"
  ]
}
```

The `"esm": true` option enables ESM-compatible output by adding the `.js` extension to the import statements in the generated files. This is necessary if you want to be able to import the library on Node.js or in a bundler that supports ESM, with some caveats. See the [Guidelines](#guidelines) section for more information.

For TypeScript, it also generates 2 sets of type definitions if the [`commonjs`](build.md#commonjs) target is also enabled: one for the CommonJS build and one for the ES module build.

It's recommended to specify `"moduleResolution": "bundler"` in your `tsconfig.json` file to match Metro's behavior:

```json
{
  "compilerOptions": {
    "moduleResolution": "bundler"
  }
}
```

Specifying `"moduleResolution": "bundler"` means that you don't need to use file extensions in the import statements. Bob automatically adds them when possible during the build process.

To make use of the output files, ensure that your `package.json` file contains the following fields:

```json
"main": "./lib/module/index.js",
"exports": {
  ".": {
    "types": "./lib/typescript/src/index.d.ts",
    "default": "./lib/module/index.js"
  },
  "./package.json": "./package.json"
},
```

The `main` field is for tools that don't support the `exports` field (e.g. [Metro](https://metrobundler.dev) < 0.82.0).

The `exports` field is used by Node.js 12+, modern browsers and tools to determine the correct entry point. The entrypoint is specified in the `.` key and will be used when the library is imported or required directly (e.g. `import 'my-library'` or `require('my-library')`).

Here, we specify 2 conditions:

- `types`: Used for the TypeScript definitions.
- `default`: Used for the actual JS code when the library is imported or required.

You can also specify additional conditions for different scenarios, such as `react-native`, `browser`, `production`, `development` etc. Note that support for these conditions depends on the tooling you're using.

The `./package.json` field is used to point to the library's `package.json` file. It's necessary for tools that may need to read the `package.json` file directly (e.g. [React Native Codegen](https://reactnative.dev/docs/the-new-architecture/what-is-codegen)).

> Note: Metro enables support for `package.json` exports by default from version [0.82.0](https://github.com/facebook/metro/releases/tag/v0.82.0). In previous versions, experimental support can be enabled by setting the `unstable_enablePackageExports` option to `true` in the [Metro configuration](https://metrobundler.dev/docs/configuration/). If this is not enabled, Metro will use the entrypoint specified in the `main` field.

## Dual package setup

The previously mentioned setup only works with tools that support ES modules. If you want to support tools that don't support ESM and use the CommonJS module system, you can set up a dual package setup.

A dual package setup means that you have 2 builds of your library: one for ESM and one for CommonJS. The ESM build is used by tools that support ES modules, while the CommonJS build is used by tools that don't support ES modules.

To configure a dual package setup, you can follow these steps:

1. Add the `commonjs` target to the `react-native-builder-bob` field in your `package.json` or `bob.config.js`:

   ```diff
   "react-native-builder-bob": {
     "source": "src",
     "output": "lib",
     "targets": [
       ["module", { "esm": true }],
   +   ["commonjs", { "esm": true }]
       "typescript",
     ]
   }
   ```

2. Optionally change the `main` field in your `package.json` to point to the CommonJS build:

   ```diff
   - "main": "./lib/module/index.js",
   + "main": "./lib/commonjs/index.js",
   ```

   This is needed if you want to support tools that don't support the `exports` field and need to use the CommonJS build.

3. Optionally add a `module` field in your `package.json` to point to the ESM build:

   ```diff
     "main": "./lib/commonjs/index.js",
   + "module": "./lib/module/index.js",
   ```

   The `module` field is a non-standard field that some tools use to determine the ESM entry point.

4. Change the `exports` field in your `package.json` to include 2 conditions:

   ```diff
   "exports": {
     ".": {
   -   "types": "./lib/typescript/src/index.d.ts",
   -   "default": "./lib/module/index.js"
   +   "import": {
   +     "types": "./lib/typescript/module/src/index.d.ts",
   +     "default": "./lib/module/index.js"
   +   },
   +   "require": {
   +     "types": "./lib/typescript/commonjs/src/index.d.ts",
   +     "default": "./lib/commonjs/index.js"
   +   }
     }
   },
   ```

   Here, we specify 2 conditions:

   - `import`: Used when the library is imported with an `import` statement or a dynamic `import()`. It will point to the ESM build.
   - `require`: Used when the library is required with a `require` call. It will point to the CommonJS build.

   Each condition has a `types` field - necessary for TypeScript to provide the appropriate definitions for the module system. The type definitions have slightly different semantics for CommonJS and ESM, so it's important to specify them separately.

   The `default` field is the fallback entry point for both conditions. It's used for the actual JS code when the library is imported or required.

> **Important:** With this approach, the ESM and CommonJS versions of the package are treated as separate modules by Node.js as they are different files, leading to [potential issues](https://nodejs.org/docs/latest-v19.x/api/packages.html#dual-package-hazard) if the package is both imported and required in the same runtime environment. If the package relies on any state that can cause issues if 2 separate instances are loaded, it's necessary to isolate the state into a separate CommonJS module that can be shared between the ESM and CommonJS builds.

## Guidelines

There are still a few things to keep in mind if you want your library to be ESM-compatible:

- Avoid using default exports in your library. Named exports are recommended. Default exports produce a CommonJS module with a `default` property, which will work differently than the ESM build and can cause issues.
- If the library uses platform-specific extensions (e.g., `.ios.js` or `.android.js`), the ESM output will not be compatible with Node.js, i.e. it's not possible to use the library in Node.js with `import` syntax. It's necessary to omit file extensions from the imports to make platform-specific extensions work, however, Node.js requires file extensions to be present.

  Bundlers such as Metro can handle this without additional configuration. Other bundlers may need to be configured to make extensionless imports to work, (e.g. it's necessary to specify [`resolve.fullySpecified: false`](https://webpack.js.org/configuration/module/#resolvefullyspecified) for Webpack).

  It's still possible to use the library in Node.js using the CommonJS build with `require`:

  ```js
  const { foo } = require('my-library');
  ```

  Alternatively, if you want to be able to use the library in Node.js with `import` syntax, you can use `require` to import code with platform-specific extensions in your library:

  ```js
  // will import `foo.native.js`, `foo.ios.js`, `foo.js` etc.
  const { foo } = require('./foo');
  ```

  Make sure to have a file without any platform-specific extensions that will be loaded by Node.js.

  Also note that if your module (e.g. `foo.js` in this case) contains ESM syntax, it will only work on Node.js 20 or newer.

- Avoid using `.cjs`, `.mjs`, `.cts` or `.mts` extensions. Metro always requires file extensions in import statements when using `.cjs` or `.mjs` which breaks platform-specific extension resolution.
- Avoid using `"moduleResolution": "node16"` or `"moduleResolution": "nodenext"` in your `tsconfig.json` file. They require file extensions in import statements which breaks platform-specific extension resolution.
- If you specify a `react-native` condition in `exports`, make sure that it comes before other conditions. The conditions should be ordered from the most specific to the least specific:

  ```json
  "exports": {
    ".": {
      "types": "./lib/typescript/src/index.d.ts",
      "react-native": "./lib/modules/index.native.js",
      "default": "./lib/module/index.js"
    }
  }
  ```

  Or for a dual package setup:

  ```json
  "exports": {
    ".": {
      "import": {
        "types": "./lib/typescript/module/src/index.d.ts",
        "react-native": "./lib/modules/index.native.js",
        "default": "./lib/module/index.js"
      },
      "require": {
        "types": "./lib/typescript/commonjs/src/index.d.ts",
        "react-native": "./lib/commonjs/index.native.js",
        "default": "./lib/commonjs/index.js"
      }
    },
    "./package.json": "./package.json"
  }
  ```

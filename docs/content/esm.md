# ESM support

## Default setup

Libraries created with [`create-react-native-library`](./create.md) are pre-configured to work with ESM (ECMAScript Modules) out of the box.

You can verify whether ESM support is enabled by checking the configuration for [`react-native-builder-bob`](./build.md) in the `package.json` file of the library:

```json
"react-native-builder-bob": {
  "source": "src",
  "output": "lib",
  "targets": [
    ["module", { "esm": true }],
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
"types": "./lib/typescript/src/index.d.ts",
"exports": {
  ".": {
    "source": "./src/index.tsx",
    "types": "./lib/typescript/src/index.d.ts",
    "default": "./lib/module/index.js"
  },
  "./package.json": "./package.json"
},
```

The `main` field is for tools that don't support the `exports` field (e.g. [Metro](https://metrobundler.dev) < 0.82.0). The `types` field is for legacy TypeScript setups that use `moduleResolution: "node10"` or `moduleResolution: "node"`.

The `exports` field is used by Node.js 12+, modern browsers and tools to determine the correct entry point. The entrypoint is specified in the `.` key and will be used when the library is imported or required directly (e.g. `import 'my-library'` or `require('my-library')`).

Here, we specify 3 conditions:

- `source`: A custom condition used by `react-native-builder-bob` to determine the source file for the library.
- `types`: Used for the TypeScript definitions.
- `default`: Used for the actual JS code when the library is imported or required.

You can also specify additional conditions for different scenarios, such as `react-native`, `browser`, `production`, `development` etc. Note that support for these conditions depends on the tooling you're using.

The `./package.json` field is used to point to the library's `package.json` file. It's necessary for tools that may need to read the `package.json` file directly (e.g. [React Native Codegen](https://reactnative.dev/docs/the-new-architecture/what-is-codegen)).

Using the `exports` field has a few benefits, such as:

- It allows you to specify different entry points for different environments with [conditional exports](https://nodejs.org/api/packages.html#conditional-exports) (e.g. `node`, `browser`, `module`, `react-native`, `production`, `development` etc.).
- It [restricts access to the library's internals](https://nodejs.org/api/packages.html#main-entry-point-export) by default. You can explicitly specify which files are accessible with [subpath exports](https://nodejs.org/api/packages.html#subpath-exports).

  So make sure to explicitly specify any files that need to be readable by other tools, e.g. `./app.plugin.js` if you provide a [Expo Config plugin](https://docs.expo.dev/config-plugins/plugins-and-mods/#apppluginjs):

  ```diff
  "exports": {
    ".": {
      "source": "./src/index.tsx",
      "types": "./lib/typescript/src/index.d.ts",
      "default": "./lib/module/index.js"
    },
    "./package.json": "./package.json",
  + "./app.plugin.js": "./app.plugin.js"
  },
  ```

### A note on `import.meta`

The [`import.meta`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import.meta) object is available in ESM. As per the spec, different tools may add different properties to it.

For example, Node.js adds [`import.meta.resolve`](https://nodejs.org/api/esm.html#importmetaresolvespecifier) and more, Webpack adds [`import.meta.webpackHot`](https://webpack.js.org/api/module-variables/#importmetawebpackhot), [`import.meta.webpackContext`](https://webpack.js.org/api/module-variables/#importmetawebpackcontext) and more, Vite adds [`import.meta.env`](https://vite.dev/guide/env-and-mode) and more, etc. Most tools support the `import.meta.url` property, which is a URL string representing the module's location.

Additionally, the `import.meta` syntax is currently not supported in [Metro](https://metrobundler.dev/) (React Native) and will result in a syntax error.

So be careful when using properties from `import.meta`, as relying on properties only available in specific tools may lock your library into supporting only those specific tools. Also, since this is an ESM-only feature, you should avoid using it if you compile your library to CommonJS as well.

## Dual package setup

The previously mentioned setup only works with tools that support ES modules. If you want to support tools that don't support ESM and use the CommonJS module system, you can configure a dual package setup.

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

2. Change the `exports` field in your `package.json` to include 2 conditions:

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

3. Optionally change the `main` field in your `package.json` to point to the CommonJS build:

   ```diff
   - "main": "./lib/module/index.js",
   + "main": "./lib/commonjs/index.js",
   ```

   This is needed if you want to support tools that don't support the `exports` field and need to use the CommonJS build.

4. Optionally add a `module` field in your `package.json` to point to the ESM build:

   ```diff
     "main": "./lib/commonjs/index.js",
   + "module": "./lib/module/index.js",
   ```

   The `module` field is a non-standard field that some tools use to determine the ESM entry point.

5. Optionally change the `types` field in your `package.json` to point to the CommonJS type definitions:

   ```diff
     "main": "./lib/commonjs/index.js",
     "module": "./lib/module/index.js",
   - "types": "./lib/typescript/src/index.d.ts",
   + "types": "./lib/typescript/commonjs/src/index.d.ts",
   ```

   This is necessary to support legacy TypeScript setup, i.e. which have `moduleResolution: "node10"` or `moduleResolution: "node"` under the `compilerOptions` section in the `tsconfig.json`.

Putting it all together, the fields in your `package.json` file should look like this:

```json
{
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
    },
    "./package.json": "./package.json"
  }
}
```

### Dual package hazard

With this approach, the ESM and CommonJS versions of the package are treated as separate modules by Node.js as they are different files. On Node.js, `import` will load the ESM package and `require` will load the CommonJS package, leading to [potential issues](https://nodejs.org/docs/latest-v19.x/api/packages.html#dual-package-hazard) if the package is both imported and required in the same runtime environment.

If the library relies on any state that can cause issues if 2 separate instances are loaded (e.g. global state, constructors, react context etc.), it's necessary to isolate the state into a separate CommonJS module that can be shared between the ESM and CommonJS builds.

### Alternative approach

An alternative approach to classic dual package setup is to use tool specific conditions instead of specifying both `import` and `require`. This way, each tool can load the appropriate build without resulting in a dual package hazard.

For example, here is a setup that uses ESM for Webpack, Vite, Rollup, Metro (React Native) and Node.js, and CommonJS for the rest:

```json
{
  "main": "./lib/commonjs/index.js",
  "module": "./lib/module/index.js",
  "types": "./lib/typescript/commonjs/src/index.d.ts",
  "exports": {
    ".": {
      "react-native": {
        "types": "./lib/typescript/module/src/index.d.ts",
        "default": "./lib/module/index.js"
      },
      "module": {
        "types": "./lib/typescript/module/src/index.d.ts",
        "default": "./lib/module/index.js"
      },
      "module-sync": {
        "types": "./lib/typescript/module/src/index.d.ts",
        "default": "./lib/module/index.js"
      },
      "default": {
        "types": "./lib/typescript/commonjs/src/index.d.ts",
        "default": "./lib/commonjs/index.js"
      }
    },
    "./package.json": "./package.json"
  }
}
```

Here, we specify 4 conditions:

- `react-native`: Used when the library is imported in a React Native environment with Metro.
- `module`: Used when the library is imported in some bundler ssuch as Webpack, Vite or Rollup.
- `module-sync`: Used when the library is imported on Node.js 22.10.0+ - regardless of whether it's imported with `import` or `require`.
- `default`: Fallback used when the library is imported in an environment that doesn't support the other conditions.

One thing to note is that TypeScript may need to be configured to resolve to the appropriate condition. It's pre-configured for React Native apps, but in other scenarios, it maybe necessary to specify [`customConditions`](https://www.typescriptlang.org/tsconfig/#customConditions) in the `tsconfig.json` file:

```json
{
  "compilerOptions": {
    "moduleResolution": "bundler",
    "customConditions": ["module"]
  }
}
```

This is just an example to illustrate the idea. In practice, you may want to specify appropriate conditions for your library based on the tools you want to support.

You can find a list of conditions supported in various tools in the [Runtime Keys](https://runtime-keys.proposal.wintercg.org/) proposal specification, [Node.js documentation](https://nodejs.org/docs/latest/api/packages.html#community-conditions-definitions) and [Webpack documentation](https://webpack.js.org/guides/package-exports/#conditions).

## Compatibility

[Node.js](https://nodejs.org) v12 and higher natively support ESM and the `exports` field. However, in a CommonJS environment, an ESM library can be loaded synchronously only in recent Node.js versions. The following Node.js versions support synchronous `require()` for ESM libraries without any flags or warnings:

- v20.19.0 and higher (LTS)
- v22.12.0 and higher (LTS)
- v23.4.0 and higher

Older versions can still load your library asynchronously using `import()` in CommonJS environments.

Most modern tools such as [Webpack](https://webpack.js.org), [Rollup](https://rollupjs.org), [Vite](https://vitejs.dev) etc. also support ESM and the `exports` field. See the supported conditions in the [Runtime Keys](https://runtime-keys.proposal.wintercg.org/) proposal specification, [Node.js documentation](https://nodejs.org/docs/latest/api/packages.html#community-conditions-definitions) and [Webpack documentation](https://webpack.js.org/guides/package-exports/#conditions).

[Metro](https://metrobundler.dev) enables support for `package.json` exports by default from version [0.82.0](https://github.com/facebook/metro/releases/tag/v0.82.0). In previous versions, experimental support can be enabled by setting the [`unstable_enablePackageExports` option to `true`](https://metrobundler.dev/docs/package-exports/) in the Metro configuration. If this is not enabled, Metro will use the entrypoint specified in the `main` field. Features such as [subpath exports](https://nodejs.org/api/packages.html#subpath-exports) and [conditional exports](https://nodejs.org/api/packages.html#conditional-exports) will not work when `exports` supported is not enabled.

[Jest](https://jestjs.io) supports the `exports` field, but doesn't support ESM natively. Experimental support is [available under a flag](https://jestjs.io/docs/ecmascript-modules), but requires changes to how tests are written. It can still load ESM libraries using a transform such as [`babel-jest`](https://github.com/jestjs/jest/tree/main/packages/babel-jest).

## Guidelines

There are still a few things to keep in mind if you want your library to be ESM-compatible:

- Avoid using default exports in your library. Named exports are recommended. Default exports produce a CommonJS module with a `default` property, which will work differently than the ESM build and can cause issues if you have a dual package setup. Needing to use `.default` in CommonJS environment may also be confusing for users.
- If the library uses platform-specific extensions (e.g., `.ios.js` or `.android.js`), the ESM output will not be compatible with Node.js, i.e. it's not possible to use the library in Node.js with `import` syntax. It's necessary to omit file extensions from the imports to make platform-specific extensions work, however, Node.js requires file extensions to be present.

  While Bob automatically adds file extensions to the import statements during the build process if `esm` is set to `true`, it will skip the imports that reference files with platform-specific extensions to avoid breaking the resolution.

  Bundlers such as Metro can handle imports without file extensions for ESM without additional configuration. Other bundlers may need to be configured to make extensionless imports to work, (e.g. it's necessary to specify [`resolve.fullySpecified: false`](https://webpack.js.org/configuration/module/#resolvefullyspecified) for Webpack).

  It's still possible to use the library in Node.js using the CommonJS build with `require`:

  ```js
  const { foo } = require('my-library');
  ```

  Alternatively, if you want to be able to use the library in Node.js with `import` syntax, there are a few options:

  - Use `Platform.select` instead of platform-specific extensions:

    ```js
    import { Platform } from 'react-native';

    const foo = Platform.select({
      android: require('./fooAndroid.js'),
      ios: require('./fooIOS.js'),
      default: require('./fooFallback.js'),
    });
    ```

  - Use `require` to import code with platform-specific extensions in your library:

    ```js
    // will import `foo.native.js`, `foo.ios.js`, `foo.js` etc.
    const { foo } = require('./foo');
    ```

    Make sure to have a file without any platform-specific extensions that will be loaded by Node.js.

    Also note that if your module (e.g. `foo.js` in this case) contains ESM syntax, it will only work on a recent Node.js version. See [Compatibility](#compatibility) section for more information.

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
        "react-native": "./lib/module/index.native.js",
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

  Or as a separate condition:

  ```json
  "exports": {
    ".": {
      "react-native": {
        "types": "./lib/typescript/module/src/index.native.d.ts",
        "default": "./lib/module/index.native.js"
      },
      "import": {
        "types": "./lib/typescript/module/src/index.d.ts",
        "default": "./lib/module/index.js"
      },
      "require": {
        "types": "./lib/typescript/commonjs/src/index.d.ts",
        "default": "./lib/commonjs/index.js"
      }
    },
  }
  ```

## References

- [Node.js documentation on ESM](https://nodejs.org/docs/latest/api/esm.html)
- [Publishing dual module ESM libraries](https://satya164.page/posts/publishing-dual-module-esm-libraries)
- [Are the types wrong?](https://github.com/arethetypeswrong/arethetypeswrong.github.io)
- [tshy - TypeScript HYbridizer](https://github.com/isaacs/tshy)

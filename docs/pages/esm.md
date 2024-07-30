# ESM support

Libraries created with [`create-react-native-library`](./create.md) are pre-configured to work with ESM (ECMAScript Modules) out of the box.

You can verify whether ESM support is enabled by checking the configuration for [`react-native-builder-bob`](./build.md) in the `package.json` file of the library:

```json
"react-native-builder-bob": {
  "source": "src",
  "output": "lib",
  "targets": [
    ["commonjs", { "esm": true }],
    ["module", { "esm": true }],
    ["typescript", { "esm": true }]
  ]
}
```

The `"esm": true` option enables ESM-compatible output by adding the `.js` extension to the import statements in the generated files. For TypeScript, it also generates 2 sets of type definitions: one for the CommonJS build and one for the ES module build.

It's recommended to specify `"moduleResolution": "Bundler"` in your `tsconfig.json` file as well:

```json
{
  "compilerOptions": {
    "moduleResolution": "Bundler"
  }
}
```

This means that you don't need to specify the file extension in the import statements. They'll be automatically added when possible during the build process.

## Guidelines

There are still a few things to keep in mind if you want your library to be ESM-compatible:

- Avoid using default exports in your library. Named exports are recommended. Default exports produce a CommonJS module with a `default` property, which will work differently than the ESM build and can cause issues.
- If the library uses platform-specific extensions (e.g., `.ios.js` or `.android.js`), the ESM output will not be compatible with Node.js. It's necessary to omit file extensions from the imports to make platform-specific extensions work, however, Node.js requires file extensions to be present. Bundlers such as Webpack (with [`resolve.fullySpecified: false`](https://webpack.js.org/configuration/module/#resolvefullyspecified)) or Metro can handle this. It's still possible to `require` the CommonJS build directly in Node.js.
- Avoid using `.cjs`, `.mjs`, `.cts` or `.mts` extensions. Metro always requires file extensions in import statements when using `.cjs` or `.mjs` which breaks platform-specific extension resolution.
- Avoid using `"moduleResolution": "Node16"` or `"moduleResolution": "NodeNext"` in your `tsconfig.json` file. They require file extensions in import statements which breaks platform-specific extension resolution.
- If you specify a `react-native` condition in `exports`, make sure that it comes before `import` or `require`. The conditions should be ordered from the most specific to the least specific:

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
    }
  }
  ```

# @react-native-community/bob

👷‍♂️ Simple CLI to build React Native libraries for different targets.

## Features

The CLI can build code for following targets:

- Generic CommonJS build
- ES modules build for bundlers such as webpack
- Flow definitions (copies .js files to .flow files)
- TypeScript definitions (uses tsc to generate declaration files)

## Why?

Metro handles compiling source code for React Native libraries, but it's possible to use them in other targets such as web. Currently, to handle this, we need to have multiple babel configs and write a long `babel-cli` command in our `package.json`. We also need to keep the configs in sync between our projects.

Just as an example, this is a command we have in one of the packages: `babel --extensions '.js,.ts,.tsx' --no-babelrc --config-file=./babel.config.publish.js src --ignore '**/__tests__/**' --copy-files --source-maps --delete-dir-on-start --out-dir dist && del-cli 'dist/**/__tests__' && yarn tsc --emitDeclarationOnly`. This isn't all, there's even a separate `babel.config.publish.js` file. And this only works for webpack and Metro, and will fail on Node due to ESM usage.

Bob wraps tools such as `babel` and `typescript` to simplify these common tasks across multiple projects. It's tailored specifically to React Native projects to minimize the configuration required.

## Installation

Open a Terminal in your project, and run:

```sh
yarn add --dev @react-native-community/bob
```

## Usage

To configure your project to use Bob, open a Terminal and run `yarn bob init` for automatic configuration.

To configure your project manually, follow these steps:

1. In your `package.json`, specify the targets to build for:

   ```json
   "@react-native-community/bob": {
     "source": "src",
     "output": "lib",
     "targets": [
       ["commonjs", {"flow": true}],
       "module",
       "typescript",
     ]
   }
   ```

1. Add `bob` to your `prepare` step:

   ```js
   "scripts": {
     "prepare": "bob build"
   }
   ```

1. Configure the appropriate entry points:

   ```json
   "main": "lib/commonjs/index.js",
   "module": "lib/module/index.js",
   "react-native": "src/index.js",
   "types": "lib/typescript/src/index.d.ts",
   "files": [
     "lib/",
     "src/"
   ]
   ```

1. Add the output directory to `.gitignore`

   ```gitignore
   # generated files by bob
   lib/
   ```

And we're done 🎉

## LICENSE

MIT

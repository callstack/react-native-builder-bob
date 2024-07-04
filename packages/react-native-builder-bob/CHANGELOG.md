# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [0.25.0-next.2](https://github.com/callstack/react-native-builder-bob/compare/react-native-builder-bob@0.25.0-next.1...react-native-builder-bob@0.25.0-next.2) (2024-07-04)

### Bug Fixes

- support rewriting .js extensions ([ee378e1](https://github.com/callstack/react-native-builder-bob/commit/ee378e18a4f601e44a919777da99d441ed86e70b)) - by @

# [0.25.0-next.1](https://github.com/callstack/react-native-builder-bob/compare/react-native-builder-bob@0.25.0-next.0...react-native-builder-bob@0.25.0-next.1) (2024-07-04)

### Bug Fixes

- don't add extensions if .native.ts etc. exist ([135f681](https://github.com/callstack/react-native-builder-bob/commit/135f6812c3430bf46303703bc090081fe6a758f3)) - by @satya164

# [0.25.0-next.0](https://github.com/callstack/react-native-builder-bob/compare/react-native-builder-bob@0.24.0...react-native-builder-bob@0.25.0-next.0) (2024-07-04)

### Features

- add ESM support for generated project ([#583](https://github.com/callstack/react-native-builder-bob/issues/583)) ([fb1da66](https://github.com/callstack/react-native-builder-bob/commit/fb1da66ce5da36f57255d6da9eff91b32b932307)) - by @satya164

# [0.24.0](https://github.com/callstack/react-native-builder-bob/compare/react-native-builder-bob@0.23.2...react-native-builder-bob@0.24.0) (2024-07-03)

### Features

- add a babel-plugin to add extensions to imports and handle aliases ([#576](https://github.com/callstack/react-native-builder-bob/issues/576)) ([923435b](https://github.com/callstack/react-native-builder-bob/commit/923435b0c8bd4cf08e6f76952a7c77e2f466d5c9)) - by @satya164
- expose the babel preset at react-native-builder-bob/babel-preset ([48129ea](https://github.com/callstack/react-native-builder-bob/commit/48129ea52c3c2999f409f0e874c7294b30d66bd4)) - by @satya164

## [0.23.2](https://github.com/callstack/react-native-builder-bob/compare/react-native-builder-bob@0.23.1...react-native-builder-bob@0.23.2) (2023-11-24)

**Note:** Version bump only for package react-native-builder-bob

## [0.23.1](https://github.com/callstack/react-native-builder-bob/compare/react-native-builder-bob@0.23.0...react-native-builder-bob@0.23.1) (2023-10-04)

### Bug Fixes

- detect package manager when configuring bob ([8c0cbae](https://github.com/callstack/react-native-builder-bob/commit/8c0cbae3e149be24f50e1afc5168e5ab634a4f37)) - by @satya164

# [0.23.0](https://github.com/callstack/react-native-builder-bob/compare/react-native-builder-bob@0.22.0...react-native-builder-bob@0.23.0) (2023-09-30)

### Features

- add ability to generate a local library ([#469](https://github.com/callstack/react-native-builder-bob/issues/469)) ([bf94f69](https://github.com/callstack/react-native-builder-bob/commit/bf94f692e972968877f0f400e144fb680044b277)) - by @satya164

# [0.22.0](https://github.com/callstack/react-native-builder-bob/compare/react-native-builder-bob@0.21.3...react-native-builder-bob@0.22.0) (2023-09-15)

### Bug Fixes

- add rootDir to tsconfig for consistent output folder structure ([#460](https://github.com/callstack/react-native-builder-bob/issues/460)) ([f6225fd](https://github.com/callstack/react-native-builder-bob/commit/f6225fd67cd23695c0f130a357106798bee342e1)) - by @satya164
- detect entry path and show in error messages ([#461](https://github.com/callstack/react-native-builder-bob/issues/461)) ([82ad903](https://github.com/callstack/react-native-builder-bob/commit/82ad9036f38c279a7ce523ae29b9630ac623147a)) - by @satya164
- fix locating `tsc` in yarn 3 workspaces ([#462](https://github.com/callstack/react-native-builder-bob/issues/462)) ([19396ce](https://github.com/callstack/react-native-builder-bob/commit/19396ce5be7bc6b0d914a917ca3de5303194ed41)) - by @satya164

### Features

- **bob:** add exclude option to config ([#450](https://github.com/callstack/react-native-builder-bob/issues/450)) ([ef37512](https://github.com/callstack/react-native-builder-bob/commit/ef375127a8e1b7a685e0c432099505e99c67face)) - by @atlj
- **builder-bob:** dont use npm bin to get tsc path ([#435](https://github.com/callstack/react-native-builder-bob/issues/435)) ([ef5f6db](https://github.com/callstack/react-native-builder-bob/commit/ef5f6db38f7f5db81318433e4c9f000554933f4f)), closes [#434](https://github.com/callstack/react-native-builder-bob/issues/434) - by @atlj
- support bob.config.cjs for configuration ([#442](https://github.com/callstack/react-native-builder-bob/issues/442)) ([c139df5](https://github.com/callstack/react-native-builder-bob/commit/c139df5ae26e0291e5d378d4967b0fbe293288ae)) - by @samijaber

## [0.21.3](https://github.com/callstack/react-native-builder-bob/compare/react-native-builder-bob@0.21.2...react-native-builder-bob@0.21.3) (2023-07-19)

### Bug Fixes

- warn when copyFlow is specified without flow-bin in devDependencies ([a63a9ee](https://github.com/callstack/react-native-builder-bob/commit/a63a9ee8006c1227de949896016c0a8205f61bc4)) - by @

## [0.21.2](https://github.com/callstack/react-native-builder-bob/compare/react-native-builder-bob@0.21.1...react-native-builder-bob@0.21.2) (2023-07-04)

### Bug Fixes

- prompt when running init if project already has a config ([83c5332](https://github.com/callstack/react-native-builder-bob/commit/83c5332b82cf1dd8bcc0a3c09faee90ae10aba31)) - by @satya164

## [0.21.1](https://github.com/callstack/react-native-builder-bob/compare/react-native-builder-bob@0.21.0...react-native-builder-bob@0.21.1) (2023-07-04)

### Bug Fixes

- update generated tsconfig ([c40dc3b](https://github.com/callstack/react-native-builder-bob/commit/c40dc3bed3982ab0ef795d46aa18e35fcd5aeb91)) - by @satya164

# [0.21.0](https://github.com/callstack/react-native-builder-bob/compare/react-native-builder-bob@0.20.4...react-native-builder-bob@0.21.0) (2023-06-28)

### Bug Fixes

- typescript 5 compatibility ([#374](https://github.com/callstack/react-native-builder-bob/issues/374)) ([e369644](https://github.com/callstack/react-native-builder-bob/commit/e3696441357ba199557db0289b970e018ca3c5de)), closes [#373](https://github.com/callstack/react-native-builder-bob/issues/373) - by @dcangulo

### Features

- verify that the package.json fields point to correct path ([#401](https://github.com/callstack/react-native-builder-bob/issues/401)) ([49ef758](https://github.com/callstack/react-native-builder-bob/commit/49ef7585c7ca77f28a85b033dc4193df08a748f0)) - by @satya164

## [0.20.4](https://github.com/callstack/react-native-builder-bob/compare/react-native-builder-bob@0.20.3...react-native-builder-bob@0.20.4) (2023-02-26)

### Bug Fixes

- remove extra class-props babel plugin ([#363](https://github.com/callstack/react-native-builder-bob/issues/363)) ([57755e5](https://github.com/callstack/react-native-builder-bob/commit/57755e5c39ff86db7cf22aaed392717398b9956f)), closes [#154](https://github.com/callstack/react-native-builder-bob/issues/154) - by @merrywhether
- use correct source file names relative to source dir for sourcemaps ([2eb6ed9](https://github.com/callstack/react-native-builder-bob/commit/2eb6ed9f99223489e2fa56d860abc6e65fecd6b2)) - by @

## [0.20.3](https://github.com/callstack/react-native-builder-bob/compare/react-native-builder-bob@0.20.2...react-native-builder-bob@0.20.3) (2022-12-04)

**Note:** Version bump only for package react-native-builder-bob

## [0.20.2](https://github.com/callstack/react-native-builder-bob/compare/react-native-builder-bob@0.20.1...react-native-builder-bob@0.20.2) (2022-12-02)

### Bug Fixes

- improve tsc binary detection logic ([a213197](https://github.com/callstack/react-native-builder-bob/commit/a21319703431497d5cff36914cabadf2351e63c1))

## [0.20.1](https://github.com/callstack/react-native-builder-bob/compare/react-native-builder-bob@0.20.0...react-native-builder-bob@0.20.1) (2022-11-03)

**Note:** Version bump only for package react-native-builder-bob

# [0.20.0](https://github.com/callstack/react-native-builder-bob/compare/react-native-builder-bob@0.19.1...react-native-builder-bob@0.20.0) (2022-10-15)

### Features

- add a run command to bob ([16dace2](https://github.com/callstack/react-native-builder-bob/commit/16dace209521d25f64b8d40631bb74241444938c))

## [0.19.1](https://github.com/callstack/react-native-builder-bob/compare/react-native-builder-bob@0.19.0...react-native-builder-bob@0.19.1) (2022-10-14)

### Bug Fixes

- restrict engine to latest Node LTS ([f569064](https://github.com/callstack/react-native-builder-bob/commit/f5690640cfca5b3b7c32b98c80442b08fda09150))

# [0.19.0](https://github.com/callstack/react-native-builder-bob/compare/react-native-builder-bob@0.18.3...react-native-builder-bob@0.19.0) (2022-10-13)

### Features

- improve sourcemaps generation ([#280](https://github.com/callstack/react-native-builder-bob/issues/280)) ([cb404bf](https://github.com/callstack/react-native-builder-bob/commit/cb404bf6c784c59abebe5e0cb58c2d9a1b3b3020)), closes [#279](https://github.com/callstack/react-native-builder-bob/issues/279)

## [0.18.3](https://github.com/callstack/react-native-builder-bob/compare/react-native-builder-bob@0.18.2...react-native-builder-bob@0.18.3) (2022-06-21)

**Note:** Version bump only for package react-native-builder-bob

## [0.18.2](https://github.com/callstack/react-native-builder-bob/compare/react-native-builder-bob@0.18.1...react-native-builder-bob@0.18.2) (2021-09-28)

### Bug Fixes

- call the gradle wrapper correctly on windows ([#175](https://github.com/callstack/react-native-builder-bob/issues/175)) ([53823a8](https://github.com/callstack/react-native-builder-bob/commit/53823a8435d3e3e681b5351677162e0dc904541f))

## [0.18.1](https://github.com/callstack/react-native-builder-bob/compare/react-native-builder-bob@0.18.0...react-native-builder-bob@0.18.1) (2021-03-03)

**Note:** Version bump only for package react-native-builder-bob

# 0.18.0 (2021-03-02)

**Note:** Version bump only for package react-native-builder-bob

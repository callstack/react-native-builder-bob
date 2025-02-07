# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [0.37.0](https://github.com/callstack/react-native-builder-bob/compare/react-native-builder-bob@0.36.0...react-native-builder-bob@0.37.0) (2025-02-07)

### Features

* **bob:** support custom target definitions ([#732](https://github.com/callstack/react-native-builder-bob/issues/732)) ([5b42f44](https://github.com/callstack/react-native-builder-bob/commit/5b42f440fc609d9a49b94a5435276acda9d0ade7)) - by @atlj

# [0.36.0](https://github.com/callstack/react-native-builder-bob/compare/react-native-builder-bob@0.35.3...react-native-builder-bob@0.36.0) (2025-01-28)

### Bug Fixes

* bob codegen deletes view specs when codegen type is all ([#736](https://github.com/callstack/react-native-builder-bob/issues/736)) ([7f5fbc7](https://github.com/callstack/react-native-builder-bob/commit/7f5fbc7a8ac8c68fedc2e62cff91b2696d74b635)), closes [#728](https://github.com/callstack/react-native-builder-bob/issues/728) - by @atlj

### Features

* update gh actions in template from `v3` to `v4` ([#748](https://github.com/callstack/react-native-builder-bob/issues/748)) ([64a469c](https://github.com/callstack/react-native-builder-bob/commit/64a469c55b3944284d8caa505a8b5e3f3e3a8bfe)) - by @krozniata

## [0.35.3](https://github.com/callstack/react-native-builder-bob/compare/react-native-builder-bob@0.35.2...react-native-builder-bob@0.35.3) (2025-01-28)

### Bug Fixes

* don't crash if codegenConfig is not defined in package.json ([#716](https://github.com/callstack/react-native-builder-bob/issues/716)) ([3f537f1](https://github.com/callstack/react-native-builder-bob/commit/3f537f1daf4cf01269ea00e665ed4dd0be550e27)) - by @riteshshukla04
* ios example app has duplicated symbols due to codegen ([#757](https://github.com/callstack/react-native-builder-bob/issues/757)) ([c1b508a](https://github.com/callstack/react-native-builder-bob/commit/c1b508a8fdc65775076e376568443a0bdef675c6)), closes [#755](https://github.com/callstack/react-native-builder-bob/issues/755) - by @atlj

## [0.35.2](https://github.com/callstack/react-native-builder-bob/compare/react-native-builder-bob@0.35.1...react-native-builder-bob@0.35.2) (2024-12-06)

### Bug Fixes

- fix syntax error when running the app ([b029db9](https://github.com/callstack/react-native-builder-bob/commit/b029db94aed3c7f4adba7833668ebd146fc1470e)) - by @satya164

## [0.35.1](https://github.com/callstack/react-native-builder-bob/compare/react-native-builder-bob@0.35.0...react-native-builder-bob@0.35.1) (2024-12-06)

### Reverts

- Revert "feat: enable JS codegen transform (#717)" ([262185c](https://github.com/callstack/react-native-builder-bob/commit/262185cfcec2babf4a558b9e4b5ce570e1f5ff66)), closes [#717](https://github.com/callstack/react-native-builder-bob/issues/717) - by @satya164

# [0.35.0](https://github.com/callstack/react-native-builder-bob/compare/react-native-builder-bob@0.34.0...react-native-builder-bob@0.35.0) (2024-12-06)

### Features

- enable JS codegen transform ([#717](https://github.com/callstack/react-native-builder-bob/issues/717)) ([2fc7496](https://github.com/callstack/react-native-builder-bob/commit/2fc7496e9ad18cfa20990d25f1c7d44b92eedf49)) - by @jbroma

# [0.34.0](https://github.com/callstack/react-native-builder-bob/compare/react-native-builder-bob@0.33.3...react-native-builder-bob@0.34.0) (2024-12-04)

### Bug Fixes

- correctly log error output when building ([#698](https://github.com/callstack/react-native-builder-bob/issues/698)) ([78f16fc](https://github.com/callstack/react-native-builder-bob/commit/78f16fcc9183743c19f564e421051c17e71c86d8)) - by @gronxb

### Features

- pass options to babel-preset using callers ([#704](https://github.com/callstack/react-native-builder-bob/issues/704)) ([a9f2ede](https://github.com/callstack/react-native-builder-bob/commit/a9f2edea4d478ee176034fa7970114876130e76c)) - by @satya164

## [0.33.3](https://github.com/callstack/react-native-builder-bob/compare/react-native-builder-bob@0.33.2...react-native-builder-bob@0.33.3) (2024-11-29)

### Bug Fixes

- use proper codegen types ([#697](https://github.com/callstack/react-native-builder-bob/issues/697)) ([c143bab](https://github.com/callstack/react-native-builder-bob/commit/c143babf27f08bc2d82cc2cb632e6f537961901c)), closes [/github.com/facebook/react-native/issues/46208#issuecomment-2491424662](https://github.com//github.com/facebook/react-native/issues/46208/issues/issuecomment-2491424662) - by @atlj

## [0.33.2](https://github.com/callstack/react-native-builder-bob/compare/react-native-builder-bob@0.33.1...react-native-builder-bob@0.33.2) (2024-11-27)

### Bug Fixes

- fix deleting .tsbuildinfo file ([#706](https://github.com/callstack/react-native-builder-bob/issues/706)) ([283440e](https://github.com/callstack/react-native-builder-bob/commit/283440e1e749635f1ab0a2835aad833510a1be95)) - by @satya164

## [0.33.1](https://github.com/callstack/react-native-builder-bob/compare/react-native-builder-bob@0.33.0...react-native-builder-bob@0.33.1) (2024-11-21)

### Bug Fixes

- use npx to call rnccli ([#693](https://github.com/callstack/react-native-builder-bob/issues/693)) ([1dbed97](https://github.com/callstack/react-native-builder-bob/commit/1dbed97036fcc50cdbdc142e1f105a2ac1eb3c3c)), closes [#691](https://github.com/callstack/react-native-builder-bob/issues/691) [#685](https://github.com/callstack/react-native-builder-bob/issues/685) - by @atlj

# [0.33.0](https://github.com/callstack/react-native-builder-bob/compare/react-native-builder-bob@0.32.1...react-native-builder-bob@0.33.0) (2024-11-21)

### Features

- allow to specify JSX Runtime for @babel/preset-react` ([#695](https://github.com/callstack/react-native-builder-bob/issues/695)) ([f296a24](https://github.com/callstack/react-native-builder-bob/commit/f296a249edc47bf06c6fc99eb303ab40e28c85be)), closes [#678](https://github.com/callstack/react-native-builder-bob/issues/678) - by @tjzel

## [0.32.1](https://github.com/callstack/react-native-builder-bob/compare/react-native-builder-bob@0.32.0...react-native-builder-bob@0.32.1) (2024-11-17)

### Bug Fixes

- spawn CLI directly without using Node ([#689](https://github.com/callstack/react-native-builder-bob/issues/689)) ([a299f14](https://github.com/callstack/react-native-builder-bob/commit/a299f145a70f58a74b07c3643365aa7c11fdd356)) - by @gronxb

# [0.32.0](https://github.com/callstack/react-native-builder-bob/compare/react-native-builder-bob@0.31.0...react-native-builder-bob@0.32.0) (2024-11-15)

### Features

- use node to call codegen ([#685](https://github.com/callstack/react-native-builder-bob/issues/685)) ([55eec1c](https://github.com/callstack/react-native-builder-bob/commit/55eec1cf57c234abd6de7c40dcdbb7a6c25251e5)) - by @atlj

# [0.31.0](https://github.com/callstack/react-native-builder-bob/compare/react-native-builder-bob@0.30.3...react-native-builder-bob@0.31.0) (2024-11-08)

### Features

- disable RNTA temporarily ([#658](https://github.com/callstack/react-native-builder-bob/issues/658)) ([aa400f6](https://github.com/callstack/react-native-builder-bob/commit/aa400f622d6953ff949bd749d7bc4c9af397f486)), closes [#637](https://github.com/callstack/react-native-builder-bob/issues/637) - by @atlj

## [0.30.3](https://github.com/callstack/react-native-builder-bob/compare/react-native-builder-bob@0.30.2...react-native-builder-bob@0.30.3) (2024-10-26)

### Bug Fixes

- vanilla example codegen fails ([#665](https://github.com/callstack/react-native-builder-bob/issues/665)) ([a9546fb](https://github.com/callstack/react-native-builder-bob/commit/a9546fbf33b6cc96af64c553311d0ce02e9f9de3)), closes [#662](https://github.com/callstack/react-native-builder-bob/issues/662) - by @atlj

## [0.30.2](https://github.com/callstack/react-native-builder-bob/compare/react-native-builder-bob@0.30.1...react-native-builder-bob@0.30.2) (2024-09-08)

### Bug Fixes

- conditionally generate package.json ([459d156](https://github.com/callstack/react-native-builder-bob/commit/459d156d214432e92d47d1663f9f6d5477a891f2)) - by @satya164

## [0.30.1](https://github.com/callstack/react-native-builder-bob/compare/react-native-builder-bob@0.30.0...react-native-builder-bob@0.30.1) (2024-09-08)

### Bug Fixes

- treat ESM syntax code as CommonJS if esm is not enabled ([b7a08cd](https://github.com/callstack/react-native-builder-bob/commit/b7a08cdd29e796739708f531239eba719f5c8e26)), closes [#621](https://github.com/callstack/react-native-builder-bob/issues/621) [#625](https://github.com/callstack/react-native-builder-bob/issues/625) - by @satya164

# [0.30.0](https://github.com/callstack/react-native-builder-bob/compare/react-native-builder-bob@0.29.1...react-native-builder-bob@0.30.0) (2024-08-16)

### Features

- ship codegen-generated specs ([#566](https://github.com/callstack/react-native-builder-bob/issues/566)) ([a90142f](https://github.com/callstack/react-native-builder-bob/commit/a90142f471d3c39bd5f9a98c17a64ff23be9b8af)) - by @atlj

## [0.29.1](https://github.com/callstack/react-native-builder-bob/compare/react-native-builder-bob@0.29.0...react-native-builder-bob@0.29.1) (2024-08-12)

### Bug Fixes

- always use example app's babel config. closes [#611](https://github.com/callstack/react-native-builder-bob/issues/611) ([9a471e6](https://github.com/callstack/react-native-builder-bob/commit/9a471e63e414f8cbbfce83e999f6829ede7b2d0f)) - by @

# [0.29.0](https://github.com/callstack/react-native-builder-bob/compare/react-native-builder-bob@0.28.1...react-native-builder-bob@0.29.0) (2024-08-01)

### Bug Fixes

- ensure assets are registered correctly ([#608](https://github.com/callstack/react-native-builder-bob/issues/608)) ([ab999bf](https://github.com/callstack/react-native-builder-bob/commit/ab999bfdbf195a4df1a1b2c81fcef252cda861f6)), closes [#607](https://github.com/callstack/react-native-builder-bob/issues/607) - by @satya164
- update babel preset to include class transforms for hermes ([#606](https://github.com/callstack/react-native-builder-bob/issues/606)) ([f0a7a2f](https://github.com/callstack/react-native-builder-bob/commit/f0a7a2f998f7d803e1faf3bc162206f3ed16e9a8)), closes [#605](https://github.com/callstack/react-native-builder-bob/issues/605) - by @satya164

### Features

- add esm build option for typescript ([#603](https://github.com/callstack/react-native-builder-bob/issues/603)) ([fd43167](https://github.com/callstack/react-native-builder-bob/commit/fd4316745303fd41036e392b9fa4747f1679bacf)) - by @satya164

## [0.28.1](https://github.com/callstack/react-native-builder-bob/compare/react-native-builder-bob@0.28.0...react-native-builder-bob@0.28.1) (2024-07-27)

### Bug Fixes

- read source directory from bob config ([77df6cd](https://github.com/callstack/react-native-builder-bob/commit/77df6cd3d4ffd81da5501c1251d6b45c6f095873)) - by @

# [0.28.0](https://github.com/callstack/react-native-builder-bob/compare/react-native-builder-bob@0.27.0...react-native-builder-bob@0.28.0) (2024-07-26)

### Bug Fixes

- always create package.json with type regardless of esm option ([#598](https://github.com/callstack/react-native-builder-bob/issues/598)) ([5b45554](https://github.com/callstack/react-native-builder-bob/commit/5b455542fec82fa9edfb41c0da0ddceb4e72c485)) - by @satya164

### Features

- export babel and metro configs to reduce boilerplate ([#600](https://github.com/callstack/react-native-builder-bob/issues/600)) ([d6cb1ce](https://github.com/callstack/react-native-builder-bob/commit/d6cb1ce6c9ea15fe0c1e5623c84370bffb25878f)) - by @satya164
- use the bob preset for the library during dev ([#599](https://github.com/callstack/react-native-builder-bob/issues/599)) ([3a4e724](https://github.com/callstack/react-native-builder-bob/commit/3a4e7240e9cabcdf76f45724485dbffa79daa011)) - by @satya164

# [0.27.0](https://github.com/callstack/react-native-builder-bob/compare/react-native-builder-bob@0.26.0...react-native-builder-bob@0.27.0) (2024-07-23)

### Features

- support mts, cts, mjs and cts files in source code ([#595](https://github.com/callstack/react-native-builder-bob/issues/595)) ([d522793](https://github.com/callstack/react-native-builder-bob/commit/d5227939badbd71c42c308b7f5a71cff38807ba0)) - by @satya164

# [0.26.0](https://github.com/callstack/react-native-builder-bob/compare/react-native-builder-bob@0.25.0...react-native-builder-bob@0.26.0) (2024-07-11)

### Bug Fixes

- use an alternative approach to support ESM ([0c5582b](https://github.com/callstack/react-native-builder-bob/commit/0c5582bb66f5581693e8e9913f80d2fd40d4d7c5)) - by @

### Features

- support ESM config for bob ([9b41a62](https://github.com/callstack/react-native-builder-bob/commit/9b41a626cf661a9967b20a5290515c4690d493b7)) - by @

# [0.25.0](https://github.com/callstack/react-native-builder-bob/compare/react-native-builder-bob@0.24.0...react-native-builder-bob@0.25.0) (2024-07-05)

### Bug Fixes

- avoid using react-native field ([c30fd49](https://github.com/callstack/react-native-builder-bob/commit/c30fd497b68e2b690c63f2bf077439ea7a973bd9)) - by @satya164

### Features

- add ESM support for generated project ([#583](https://github.com/callstack/react-native-builder-bob/issues/583)) ([933a3b3](https://github.com/callstack/react-native-builder-bob/commit/933a3b38e0c8426111f956518edd4488c8ed75bc)) - by @satya164
- switch to new jsx runtime ([0595213](https://github.com/callstack/react-native-builder-bob/commit/0595213e4814c9bc34c270ef89bf31f8e0bd9bed)) - by @satya164

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

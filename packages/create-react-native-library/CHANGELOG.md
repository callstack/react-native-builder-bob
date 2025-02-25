# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.48.3](https://github.com/callstack/react-native-builder-bob/compare/create-react-native-library@0.48.2...create-react-native-library@0.48.3) (2025-02-25)

### Bug Fixes

* bring back [#715](https://github.com/callstack/react-native-builder-bob/issues/715) to fix Android builds for Fabric components ([#769](https://github.com/callstack/react-native-builder-bob/issues/769)) ([be8b107](https://github.com/callstack/react-native-builder-bob/commit/be8b1072f4618b67bbe94f89d828a3e70b06ad53)) - by @Serchinastico

## [0.48.2](https://github.com/callstack/react-native-builder-bob/compare/create-react-native-library@0.48.1...create-react-native-library@0.48.2) (2025-02-19)

### Bug Fixes

* Import `@DoNotStrip` ([#770](https://github.com/callstack/react-native-builder-bob/issues/770)) ([d3db624](https://github.com/callstack/react-native-builder-bob/commit/d3db6247ace621c2445783898e6a8fe066f5bd44)) - by @mrousavy

## [0.48.1](https://github.com/callstack/react-native-builder-bob/compare/create-react-native-library@0.48.0...create-react-native-library@0.48.1) (2025-02-10)

### Bug Fixes

* **crnl:** fix nitro modules android template ([#765](https://github.com/callstack/react-native-builder-bob/issues/765)) ([b56706b](https://github.com/callstack/react-native-builder-bob/commit/b56706b0483010dc16708d31bbeb3f37ab0fef0a)) - by @birgernass

# [0.48.0](https://github.com/callstack/react-native-builder-bob/compare/create-react-native-library@0.47.1...create-react-native-library@0.48.0) (2025-02-07)

### Features

* **crnl:** support nitro modules ([#721](https://github.com/callstack/react-native-builder-bob/issues/721)) ([70ba9e1](https://github.com/callstack/react-native-builder-bob/commit/70ba9e1718cf97ff98c4d92c7b675ed57f1d6f4a)) - by @atlj

## [0.47.1](https://github.com/callstack/react-native-builder-bob/compare/create-react-native-library@0.47.0...create-react-native-library@0.47.1) (2025-02-07)

### Bug Fixes

* `nkdversion` -> `ndkVersion` casing in `gradle.properties` ([#744](https://github.com/callstack/react-native-builder-bob/issues/744)) ([981eea1](https://github.com/callstack/react-native-builder-bob/commit/981eea148bf092fd1107173863417b54353f7202)), closes [/github.com/callstack/react-native-builder-bob/blob/87b0032acd66b7b14a5b358117a3d1497c59baad/packages/create-react-native-library/templates/native-common/android/build.gradle#L62](https://github.com//github.com/callstack/react-native-builder-bob/blob/87b0032acd66b7b14a5b358117a3d1497c59baad/packages/create-react-native-library/templates/native-common/android/build.gradle/issues/L62) - by @KiwiKilian

# [0.47.0](https://github.com/callstack/react-native-builder-bob/compare/create-react-native-library@0.46.0...create-react-native-library@0.47.0) (2025-01-28)

### Bug Fixes

* build architectures needed only for cpp projects ([#753](https://github.com/callstack/react-native-builder-bob/issues/753)) ([9509158](https://github.com/callstack/react-native-builder-bob/commit/95091588167d0d4ffd04363030945c654ec60d30)) - by @okwasniewski
* codegen generated headers are public on ios ([#737](https://github.com/callstack/react-native-builder-bob/issues/737)) ([5a68aa7](https://github.com/callstack/react-native-builder-bob/commit/5a68aa7507254704b762f01475d5306ddf2aaec6)), closes [#690](https://github.com/callstack/react-native-builder-bob/issues/690) - by @atlj

### Features

* **android:** upgrade SDK versions and build tools ([#742](https://github.com/callstack/react-native-builder-bob/issues/742)) ([388ad09](https://github.com/callstack/react-native-builder-bob/commit/388ad09ed748fc00c278ade6402fb7e62fa2be64)) - by @szymonrybczak
* update gh actions in template from `v3` to `v4` ([#748](https://github.com/callstack/react-native-builder-bob/issues/748)) ([64a469c](https://github.com/callstack/react-native-builder-bob/commit/64a469c55b3944284d8caa505a8b5e3f3e3a8bfe)) - by @krozniata

# [0.46.0](https://github.com/callstack/react-native-builder-bob/compare/create-react-native-library@0.45.5...create-react-native-library@0.46.0) (2025-01-28)

### Bug Fixes

* js-only libraries have codegen config ([#758](https://github.com/callstack/react-native-builder-bob/issues/758)) ([d17ce35](https://github.com/callstack/react-native-builder-bob/commit/d17ce35fab6361f6ef8a6540929f75badb39af92)), closes [#754](https://github.com/callstack/react-native-builder-bob/issues/754) - by @atlj
* remove deprecated hasConstants parameter ([#729](https://github.com/callstack/react-native-builder-bob/issues/729)) ([4bb5d9d](https://github.com/callstack/react-native-builder-bob/commit/4bb5d9dc31e8a6d016de1ba20860ab3ff5fb6a6b)), closes [/github.com/facebook/react-native/blob/5c789c3d3a91f4e4ee06e97cdeec7dcb64a5cf44/packages/react-native/ReactAndroid/src/main/java/com/facebook/react/module/model/ReactModuleInfo.kt#L25](https://github.com//github.com/facebook/react-native/blob/5c789c3d3a91f4e4ee06e97cdeec7dcb64a5cf44/packages/react-native/ReactAndroid/src/main/java/com/facebook/react/module/model/ReactModuleInfo.kt/issues/L25) - by @satya164

### Features

* add issue templates ([#696](https://github.com/callstack/react-native-builder-bob/issues/696)) ([4c046a2](https://github.com/callstack/react-native-builder-bob/commit/4c046a227061e67c256d5af33e5be4fc13d84433)) - by @okwasniewski

## [0.45.5](https://github.com/callstack/react-native-builder-bob/compare/create-react-native-library@0.45.3...create-react-native-library@0.45.5) (2024-12-09)

### Bug Fixes

- don't crash if resolving version fails ([a403f14](https://github.com/callstack/react-native-builder-bob/commit/a403f149d2c578b5dcf524951f29b2aa0baa9619)) - by @satya164
- don't create example app for local library ([4f64b22](https://github.com/callstack/react-native-builder-bob/commit/4f64b22d19fee8a28f4c6541b7413b6de14eba1a)) - by @satya164
- improve example app descriptions ([b8c3293](https://github.com/callstack/react-native-builder-bob/commit/b8c32937b1a7dd98d6322c5b0377ad9fa2ed44d4)) - by @satya164
- validate arguments correctly ([#724](https://github.com/callstack/react-native-builder-bob/issues/724)) ([a34d80f](https://github.com/callstack/react-native-builder-bob/commit/a34d80fcf76aff1e3797f1ca1fd586fce7900731)) - by @satya164

## [0.45.4](https://github.com/callstack/react-native-builder-bob/compare/create-react-native-library@0.45.3...create-react-native-library@0.45.4) (2024-12-08)

### Bug Fixes

- don't crash if resolving version fails ([a403f14](https://github.com/callstack/react-native-builder-bob/commit/a403f149d2c578b5dcf524951f29b2aa0baa9619)) - by @satya164
- validate arguments correctly ([#724](https://github.com/callstack/react-native-builder-bob/issues/724)) ([a34d80f](https://github.com/callstack/react-native-builder-bob/commit/a34d80fcf76aff1e3797f1ca1fd586fce7900731)) - by @satya164

## [0.45.3](https://github.com/callstack/react-native-builder-bob/compare/create-react-native-library@0.45.2...create-react-native-library@0.45.3) (2024-12-06)

### Bug Fixes

- fix codegen script failing due to missing platforms ([86c5c67](https://github.com/callstack/react-native-builder-bob/commit/86c5c67656712a990f2dd1c9eda761c7082d52e6)) - by @satya164

## [0.45.2](https://github.com/callstack/react-native-builder-bob/compare/create-react-native-library@0.45.1...create-react-native-library@0.45.2) (2024-12-06)

**Note:** Version bump only for package create-react-native-library

## [0.45.1](https://github.com/callstack/react-native-builder-bob/compare/create-react-native-library@0.45.0...create-react-native-library@0.45.1) (2024-12-06)

**Note:** Version bump only for package create-react-native-library

# [0.45.0](https://github.com/callstack/react-native-builder-bob/compare/create-react-native-library@0.44.3...create-react-native-library@0.45.0) (2024-12-04)

### Bug Fixes

- ensure 'invokeLibraryCodegen' task executes 'npx' correctly on windows ([#707](https://github.com/callstack/react-native-builder-bob/issues/707)) ([2553e24](https://github.com/callstack/react-native-builder-bob/commit/2553e24942c9c021d7e3db2c3e1eec1bacf8063f)) - by @ddiazFG
- fix incorrect check for --react-native-version ([#709](https://github.com/callstack/react-native-builder-bob/issues/709)) ([6628b2a](https://github.com/callstack/react-native-builder-bob/commit/6628b2a3bdbd3f02b111c6500fc83d94bc123d80)) - by @satya164
- move from TurboReactPackage to BaseReactPackage ([#708](https://github.com/callstack/react-native-builder-bob/issues/708)) ([bcccda5](https://github.com/callstack/react-native-builder-bob/commit/bcccda5257415785da6442aafa4edd7ae767307b)) - by @satya164
- remove experimental from new arch ([#705](https://github.com/callstack/react-native-builder-bob/issues/705)) ([62352f8](https://github.com/callstack/react-native-builder-bob/commit/62352f81293298af529c2537c833304714e351de)) - by @okwasniewski
- update tsconfig to align how metro resolves package exports ([#701](https://github.com/callstack/react-native-builder-bob/issues/701)) ([e52ba57](https://github.com/callstack/react-native-builder-bob/commit/e52ba57a6c629e5a2e867d9925064e7c1653eb84)) - by @satya164
- use 'all' for fabric components codegen config ([#715](https://github.com/callstack/react-native-builder-bob/issues/715)) ([219055b](https://github.com/callstack/react-native-builder-bob/commit/219055b3902a848dab7012672438d001cfe66834)), closes [#661](https://github.com/callstack/react-native-builder-bob/issues/661) - by @satya164

### Features

- pass options to babel-preset using callers ([#704](https://github.com/callstack/react-native-builder-bob/issues/704)) ([a9f2ede](https://github.com/callstack/react-native-builder-bob/commit/a9f2edea4d478ee176034fa7970114876130e76c)) - by @satya164

## [0.44.3](https://github.com/callstack/react-native-builder-bob/compare/create-react-native-library@0.44.2...create-react-native-library@0.44.3) (2024-11-29)

### Bug Fixes

- use proper codegen types ([#697](https://github.com/callstack/react-native-builder-bob/issues/697)) ([c143bab](https://github.com/callstack/react-native-builder-bob/commit/c143babf27f08bc2d82cc2cb632e6f537961901c)), closes [/github.com/facebook/react-native/issues/46208#issuecomment-2491424662](https://github.com//github.com/facebook/react-native/issues/46208/issues/issuecomment-2491424662) - by @atlj

## [0.44.2](https://github.com/callstack/react-native-builder-bob/compare/create-react-native-library@0.44.1...create-react-native-library@0.44.2) (2024-11-20)

### Bug Fixes

- add react-native.config.js to the published file list ([#659](https://github.com/callstack/react-native-builder-bob/issues/659)) ([625236b](https://github.com/callstack/react-native-builder-bob/commit/625236bd5c096ace55c7ac63849ed807896a083b)) - by @johnf

## [0.44.1](https://github.com/callstack/react-native-builder-bob/compare/create-react-native-library@0.44.0...create-react-native-library@0.44.1) (2024-11-15)

### Bug Fixes

- single answer questions dont get stored with metadata ([#633](https://github.com/callstack/react-native-builder-bob/issues/633)) ([c1d8ab1](https://github.com/callstack/react-native-builder-bob/commit/c1d8ab11f31552720c2f4b735842e83b17bb804d)) - by @atlj

# [0.44.0](https://github.com/callstack/react-native-builder-bob/compare/create-react-native-library@0.43.0...create-react-native-library@0.44.0) (2024-11-15)

### Bug Fixes

- correct the paths for codegen generated header files on views ([#680](https://github.com/callstack/react-native-builder-bob/issues/680)) ([6069721](https://github.com/callstack/react-native-builder-bob/commit/606972160c18117d4dc466c87652498119322a87)), closes [#669](https://github.com/callstack/react-native-builder-bob/issues/669) [ios#2](https://github.com/ios/issues/2) - by @atlj
- every created example app is testing app ([#684](https://github.com/callstack/react-native-builder-bob/issues/684)) ([4a3d2a1](https://github.com/callstack/react-native-builder-bob/commit/4a3d2a120466b95058f4fe3d08eed165582c99ad)) - by @atlj
- expo app doesn't have index.js ([#686](https://github.com/callstack/react-native-builder-bob/issues/686)) ([f08ab08](https://github.com/callstack/react-native-builder-bob/commit/f08ab088fdefe33389843e02ae600236746393cd)), closes [#682](https://github.com/callstack/react-native-builder-bob/issues/682) - by @atlj

### Features

- don't add a XCode prebuild action to invoke codegen anymore ([#679](https://github.com/callstack/react-native-builder-bob/issues/679)) ([8fc684a](https://github.com/callstack/react-native-builder-bob/commit/8fc684a4a2c90cfa10e005da112e2836c86cf316)) - by @atlj

# [0.43.0](https://github.com/callstack/react-native-builder-bob/compare/create-react-native-library@0.42.3...create-react-native-library@0.43.0) (2024-11-08)

### Features

- disable RNTA temporarily ([#658](https://github.com/callstack/react-native-builder-bob/issues/658)) ([aa400f6](https://github.com/callstack/react-native-builder-bob/commit/aa400f622d6953ff949bd749d7bc4c9af397f486)), closes [#637](https://github.com/callstack/react-native-builder-bob/issues/637) - by @atlj

## [0.42.3](https://github.com/callstack/react-native-builder-bob/compare/create-react-native-library@0.42.2...create-react-native-library@0.42.3) (2024-11-08)

**Note:** Version bump only for package create-react-native-library

## [0.42.2](https://github.com/callstack/react-native-builder-bob/compare/create-react-native-library@0.42.1...create-react-native-library@0.42.2) (2024-10-26)

### Bug Fixes

- vanilla example codegen fails ([#665](https://github.com/callstack/react-native-builder-bob/issues/665)) ([a9546fb](https://github.com/callstack/react-native-builder-bob/commit/a9546fbf33b6cc96af64c553311d0ce02e9f9de3)), closes [#662](https://github.com/callstack/react-native-builder-bob/issues/662) - by @atlj

## [0.42.1](https://github.com/callstack/react-native-builder-bob/compare/create-react-native-library@0.42.0...create-react-native-library@0.42.1) (2024-10-24)

### Bug Fixes

- unknown option npm when generating a vanilla example app ([#664](https://github.com/callstack/react-native-builder-bob/issues/664)) ([84430e4](https://github.com/callstack/react-native-builder-bob/commit/84430e4b63ec7549451337a94cd3461260c461f8)), closes [#663](https://github.com/callstack/react-native-builder-bob/issues/663) - by @atlj

# [0.42.0](https://github.com/callstack/react-native-builder-bob/compare/create-react-native-library@0.41.2...create-react-native-library@0.42.0) (2024-10-18)

### Bug Fixes

- make sure react-native.config.json is shipped with each library Fixes [#647](https://github.com/callstack/react-native-builder-bob/issues/647) ([#648](https://github.com/callstack/react-native-builder-bob/issues/648)) ([86fab42](https://github.com/callstack/react-native-builder-bob/commit/86fab425f93aeb0685e00d33619f6a81ca0ec0a7)), closes [/github.com/callstack/react-native-builder-bob/commit/a90142f471d3c39bd5f9a98c17a64ff23be9b8af#diff-4282562f42ade49c2eb46dee36bcbb7987322efec211330f48387a10e5514678R206](https://github.com//github.com/callstack/react-native-builder-bob/commit/a90142f471d3c39bd5f9a98c17a64ff23be9b8af/issues/diff-4282562f42ade49c2eb46dee36bcbb7987322efec211330f48387a10e5514678R206) - by @johnf

### Features

- make the vanilla example app the first option ([#654](https://github.com/callstack/react-native-builder-bob/issues/654)) ([cc509bb](https://github.com/callstack/react-native-builder-bob/commit/cc509bb9df23b95f6488e717b2894a14eb534007)), closes [#639](https://github.com/callstack/react-native-builder-bob/issues/639) - by @atlj

## [0.41.2](https://github.com/callstack/react-native-builder-bob/compare/create-react-native-library@0.41.1...create-react-native-library@0.41.2) (2024-09-13)

### Bug Fixes

- typo in cmakeListsPath for turbo native modules ([#629](https://github.com/callstack/react-native-builder-bob/issues/629)) ([de254c6](https://github.com/callstack/react-native-builder-bob/commit/de254c64a0a172df6048c12a63ebd9f55ff9ec88)), closes [#627](https://github.com/callstack/react-native-builder-bob/issues/627) - by @withSang

## [0.41.1](https://github.com/callstack/react-native-builder-bob/compare/create-react-native-library@0.41.0...create-react-native-library@0.41.1) (2024-09-08)

### Bug Fixes

- creating library with react-native-test-app example ([#622](https://github.com/callstack/react-native-builder-bob/issues/622)) ([25f9556](https://github.com/callstack/react-native-builder-bob/commit/25f955688fa08d1688d47ab66056e87740a9ae19)) - by @szymonrybczak

# [0.41.0](https://github.com/callstack/react-native-builder-bob/compare/create-react-native-library@0.40.0...create-react-native-library@0.41.0) (2024-08-16)

### Features

- ship codegen-generated specs ([#566](https://github.com/callstack/react-native-builder-bob/issues/566)) ([a90142f](https://github.com/callstack/react-native-builder-bob/commit/a90142f471d3c39bd5f9a98c17a64ff23be9b8af)) - by @atlj

# [0.40.0](https://github.com/callstack/react-native-builder-bob/compare/create-react-native-library@0.39.0...create-react-native-library@0.40.0) (2024-08-01)

### Bug Fixes

- update babel preset to include class transforms for hermes ([#606](https://github.com/callstack/react-native-builder-bob/issues/606)) ([f0a7a2f](https://github.com/callstack/react-native-builder-bob/commit/f0a7a2f998f7d803e1faf3bc162206f3ed16e9a8)), closes [#605](https://github.com/callstack/react-native-builder-bob/issues/605) - by @satya164

### Features

- add esm build option for typescript ([#603](https://github.com/callstack/react-native-builder-bob/issues/603)) ([fd43167](https://github.com/callstack/react-native-builder-bob/commit/fd4316745303fd41036e392b9fa4747f1679bacf)) - by @satya164

# [0.39.0](https://github.com/callstack/react-native-builder-bob/compare/create-react-native-library@0.38.4...create-react-native-library@0.39.0) (2024-07-26)

### Bug Fixes

- prefetch bob version in advance to reduce timeouts ([3a67f50](https://github.com/callstack/react-native-builder-bob/commit/3a67f50e29fee3352a7f83943e1384a37e5b9122)) - by @satya164
- sort dependencies in example package.json ([6bcb6c8](https://github.com/callstack/react-native-builder-bob/commit/6bcb6c86ce3fe77cda644aeb9de99023473caeef)) - by @satya164

### Features

- export babel and metro configs to reduce boilerplate ([#600](https://github.com/callstack/react-native-builder-bob/issues/600)) ([d6cb1ce](https://github.com/callstack/react-native-builder-bob/commit/d6cb1ce6c9ea15fe0c1e5623c84370bffb25878f)) - by @satya164
- use the bob preset for the library during dev ([#599](https://github.com/callstack/react-native-builder-bob/issues/599)) ([3a4e724](https://github.com/callstack/react-native-builder-bob/commit/3a4e7240e9cabcdf76f45724485dbffa79daa011)) - by @satya164

## [0.38.4](https://github.com/callstack/react-native-builder-bob/compare/create-react-native-library@0.38.3...create-react-native-library@0.38.4) (2024-07-23)

### Bug Fixes

- add correct script on Android ([#596](https://github.com/callstack/react-native-builder-bob/issues/596)) ([bf38b29](https://github.com/callstack/react-native-builder-bob/commit/bf38b29fba5a40130615a3cbc82a40155b0ef251)) - by @szymonrybczak
- exclude output folder from typescript ([7e00f2b](https://github.com/callstack/react-native-builder-bob/commit/7e00f2bb5d0f59a02b65cb53a700ed19f0de5393)) - by @satya164

## [0.38.3](https://github.com/callstack/react-native-builder-bob/compare/create-react-native-library@0.38.2...create-react-native-library@0.38.3) (2024-07-22)

### Bug Fixes

- hide select example question when creating local library ([#594](https://github.com/callstack/react-native-builder-bob/issues/594)) ([ac95039](https://github.com/callstack/react-native-builder-bob/commit/ac9503965015ea5c65d9b7c95e7345fd4ef586ac)) - by @szymonrybczak

## [0.38.2](https://github.com/callstack/react-native-builder-bob/compare/create-react-native-library@0.38.1...create-react-native-library@0.38.2) (2024-07-11)

### Bug Fixes

- bump fallback bob version ([42efae5](https://github.com/callstack/react-native-builder-bob/commit/42efae5f63af05c6564021bbc907ce6d5a7dcc05)) - by @
- use an alternative approach to support ESM ([0c5582b](https://github.com/callstack/react-native-builder-bob/commit/0c5582bb66f5581693e8e9913f80d2fd40d4d7c5)) - by @

## [0.38.1](https://github.com/callstack/react-native-builder-bob/compare/create-react-native-library@0.38.0...create-react-native-library@0.38.1) (2024-07-05)

### Bug Fixes

- fix enabling new arch for test-app example on android ([9c79ec7](https://github.com/callstack/react-native-builder-bob/commit/9c79ec77f8363d3e3f371c616012777b1b8524f3)) - by @satya164

# [0.38.0](https://github.com/callstack/react-native-builder-bob/compare/create-react-native-library@0.37.2...create-react-native-library@0.38.0) (2024-07-05)

### Bug Fixes

- avoid using react-native field ([c30fd49](https://github.com/callstack/react-native-builder-bob/commit/c30fd497b68e2b690c63f2bf077439ea7a973bd9)) - by @satya164
- update the package name and bundleIdentifier for example app ([93a7d04](https://github.com/callstack/react-native-builder-bob/commit/93a7d04c6c43a34572d416f4af75ea427001bce4)) - by @

### Features

- add ESM support for generated project ([#583](https://github.com/callstack/react-native-builder-bob/issues/583)) ([933a3b3](https://github.com/callstack/react-native-builder-bob/commit/933a3b38e0c8426111f956518edd4488c8ed75bc)) - by @satya164
- switch to new jsx runtime ([0595213](https://github.com/callstack/react-native-builder-bob/commit/0595213e4814c9bc34c270ef89bf31f8e0bd9bed)) - by @satya164

## [0.37.2](https://github.com/callstack/react-native-builder-bob/compare/create-react-native-library@0.37.1...create-react-native-library@0.37.2) (2024-07-05)

### Bug Fixes

- fix `build:ios/android` commands in test-app example ([#585](https://github.com/callstack/react-native-builder-bob/issues/585)) ([f89fd66](https://github.com/callstack/react-native-builder-bob/commit/f89fd669b2a1a07a770e12998dabea345bec7a34)) - by @szymonrybczak

## [0.37.1](https://github.com/callstack/react-native-builder-bob/compare/create-react-native-library@0.37.0...create-react-native-library@0.37.1) (2024-07-04)

### Bug Fixes

- devDependencies doesn't exist in rootPackageJson ([#584](https://github.com/callstack/react-native-builder-bob/issues/584)) ([5a089f1](https://github.com/callstack/react-native-builder-bob/commit/5a089f1e1fb614fcdd8b6b6a54fdc69d77d7a3d9)) - by @iMokhles

# [0.37.0](https://github.com/callstack/react-native-builder-bob/compare/create-react-native-library@0.36.0...create-react-native-library@0.37.0) (2024-07-03)

### Bug Fixes

- disable jetifier for generated native examples ([#563](https://github.com/callstack/react-native-builder-bob/issues/563)) ([3676c71](https://github.com/callstack/react-native-builder-bob/commit/3676c715c7f3aa809aa969657305ac915e5f4cbf)) - by @atlj
- don't ask about defaults if language or type is passed ([567aaaf](https://github.com/callstack/react-native-builder-bob/commit/567aaafe5070726fda6e8dd5d4a7f2ea6b8398a7)) - by @satya164
- use the corresponding react-native init version ([#581](https://github.com/callstack/react-native-builder-bob/issues/581)) ([1ff7d0c](https://github.com/callstack/react-native-builder-bob/commit/1ff7d0cf559f3eae118c0f6dc0d4533422d515f7)), closes [#580](https://github.com/callstack/react-native-builder-bob/issues/580) - by @TatianaKapos

### Features

- ask to use recommended template ([#564](https://github.com/callstack/react-native-builder-bob/issues/564)) ([71f3874](https://github.com/callstack/react-native-builder-bob/commit/71f3874bd5cfbe0560c444054f09c7f4babbeb81)) - by @atlj
- **crnl:** store metadata with new projects ([#551](https://github.com/callstack/react-native-builder-bob/issues/551)) ([cb8f969](https://github.com/callstack/react-native-builder-bob/commit/cb8f96997ecfea4c0923b4e6a055cc7d0e300696)) - by @atlj
- merge view+module native templates ([#562](https://github.com/callstack/react-native-builder-bob/issues/562)) ([a75cf32](https://github.com/callstack/react-native-builder-bob/commit/a75cf32890804bcfc20819df4fdfe5bd4fafb7f2)) - by @atlj
- use metro for web bundling in js library template ([#574](https://github.com/callstack/react-native-builder-bob/issues/574)) ([6422571](https://github.com/callstack/react-native-builder-bob/commit/64225716553181a84a3da129c01a572ef4e05a06)) - by @satya164

# [0.36.0](https://github.com/callstack/react-native-builder-bob/compare/create-react-native-library@0.35.1...create-react-native-library@0.36.0) (2024-05-29)

### Bug Fixes

- add abiFilters to the native template ([#546](https://github.com/callstack/react-native-builder-bob/issues/546)) ([c7dfe9e](https://github.com/callstack/react-native-builder-bob/commit/c7dfe9ee8d088eb847ab7b29ba87221662f7f49d)) - by @j-piasecki
- podspec file indentation ([#530](https://github.com/callstack/react-native-builder-bob/issues/530)) ([148fda0](https://github.com/callstack/react-native-builder-bob/commit/148fda0b46a56e8f8d83a91e182592299063fbb1)) - by @olessavluk

### Features

- **crnl:** pass --template blank to create-expo-app ([#558](https://github.com/callstack/react-native-builder-bob/issues/558)) ([87f32b8](https://github.com/callstack/react-native-builder-bob/commit/87f32b81cc3cf353080870984192dfc90251dc51)) - by @atlj

## [0.35.1](https://github.com/callstack/react-native-builder-bob/compare/create-react-native-library@0.35.0...create-react-native-library@0.35.1) (2024-02-16)

### Bug Fixes

- jsi no template error ([#516](https://github.com/callstack/react-native-builder-bob/issues/516)) ([836d1a9](https://github.com/callstack/react-native-builder-bob/commit/836d1a9da4f5c7897a184f7361bd64b18161a64d)), closes [/github.com/facebook/react-native/blob/main/packages/react-native/ReactCommon/jsi/jsi/jsi.h#L1122](https://github.com//github.com/facebook/react-native/blob/main/packages/react-native/ReactCommon/jsi/jsi/jsi.h/issues/L1122) [/github.com/facebook/react-native/blob/main/packages/react-native/ReactCommon/jsi/jsi/CMakeLists.txt#L6](https://github.com//github.com/facebook/react-native/blob/main/packages/react-native/ReactCommon/jsi/jsi/CMakeLists.txt/issues/L6) - by @dcangulo
- remove engines from the generated library ([29d446b](https://github.com/callstack/react-native-builder-bob/commit/29d446b5a62afdb527f439a4cc34b2751b2928de)) - by @satya164

# [0.35.0](https://github.com/callstack/react-native-builder-bob/compare/create-react-native-library@0.34.3...create-react-native-library@0.35.0) (2023-12-06)

### Bug Fixes

- remove CMake warning ([#500](https://github.com/callstack/react-native-builder-bob/issues/500)) ([1ee886a](https://github.com/callstack/react-native-builder-bob/commit/1ee886a8674756d20bddae6f98be3aebc2cbcc5c)) - by @dcangulo
- remove npm publish warning ([#502](https://github.com/callstack/react-native-builder-bob/issues/502)) ([6780418](https://github.com/callstack/react-native-builder-bob/commit/678041874f9f045b272c707f7f1437bcefcab6f3)) - by @dcangulo

### Features

- add support for react native 0.73 ([45e2424](https://github.com/callstack/react-native-builder-bob/commit/45e242435a458193171387a46fa0a22dc7f4e3fa)) - by @satya164

## [0.34.3](https://github.com/callstack/react-native-builder-bob/compare/create-react-native-library@0.34.2...create-react-native-library@0.34.3) (2023-11-24)

### Bug Fixes

- adjust lefthook config ([62b7e77](https://github.com/callstack/react-native-builder-bob/commit/62b7e77c43a99c32c27266921355765a1e33c42b)) - by @satya164
- remove unused cmake abiFilters ([#486](https://github.com/callstack/react-native-builder-bob/issues/486)) ([7582485](https://github.com/callstack/react-native-builder-bob/commit/75824857f52ccad094831bea55fd72a007b829df)) - by @Sunbreak

## [0.34.2](https://github.com/callstack/react-native-builder-bob/compare/create-react-native-library@0.34.1...create-react-native-library@0.34.2) (2023-10-19)

**Note:** Version bump only for package create-react-native-library

## [0.34.1](https://github.com/callstack/react-native-builder-bob/compare/create-react-native-library@0.34.0...create-react-native-library@0.34.1) (2023-10-04)

### Bug Fixes

- fix build failure with react-native 0.73 rc ([eac4396](https://github.com/callstack/react-native-builder-bob/commit/eac4396bfd5ffa61366ed777ea1e913b95e652e3)) - by @satya164

# [0.34.0](https://github.com/callstack/react-native-builder-bob/compare/create-react-native-library@0.33.0...create-react-native-library@0.34.0) (2023-09-30)

### Bug Fixes

- don't initialize git repo if we're already under a git repo ([2c1c4e7](https://github.com/callstack/react-native-builder-bob/commit/2c1c4e7cacd924ed8d0394c3644ccdc397a0efd5)) - by @satya164

### Features

- add ability to generate a local library ([#469](https://github.com/callstack/react-native-builder-bob/issues/469)) ([bf94f69](https://github.com/callstack/react-native-builder-bob/commit/bf94f692e972968877f0f400e144fb680044b277)) - by @satya164

# [0.33.0](https://github.com/callstack/react-native-builder-bob/compare/create-react-native-library@0.32.0...create-react-native-library@0.33.0) (2023-09-22)

### Features

- upgrade template and repo to Yarn 3 ([#421](https://github.com/callstack/react-native-builder-bob/issues/421)) ([f90ce89](https://github.com/callstack/react-native-builder-bob/commit/f90ce8920c5c8ce6d4904f9b47200d18270d067a)) - by @satya164

# [0.32.0](https://github.com/callstack/react-native-builder-bob/compare/create-react-native-library@0.31.1...create-react-native-library@0.32.0) (2023-09-15)

### Bug Fixes

- add rootDir to tsconfig for consistent output folder structure ([#460](https://github.com/callstack/react-native-builder-bob/issues/460)) ([f6225fd](https://github.com/callstack/react-native-builder-bob/commit/f6225fd67cd23695c0f130a357106798bee342e1)) - by @satya164
- don't hardcode the location for react-native on android ([#424](https://github.com/callstack/react-native-builder-bob/issues/424)) ([7fc7f1c](https://github.com/callstack/react-native-builder-bob/commit/7fc7f1c07fc606229d7e8529310b88d5afe5e05d)) - by @Sunbreak
- fix locating `tsc` in yarn 3 workspaces ([#462](https://github.com/callstack/react-native-builder-bob/issues/462)) ([19396ce](https://github.com/callstack/react-native-builder-bob/commit/19396ce5be7bc6b0d914a917ca3de5303194ed41)) - by @satya164

### Features

- **crnl:** rn-community/eslint-config -> rn/eslint-config ([#452](https://github.com/callstack/react-native-builder-bob/issues/452)) ([a5d472b](https://github.com/callstack/react-native-builder-bob/commit/a5d472ba39908c7da85dcd91b85dbbde99350fbd)), closes [#443](https://github.com/callstack/react-native-builder-bob/issues/443) - by @atlj

## [0.31.1](https://github.com/callstack/react-native-builder-bob/compare/create-react-native-library@0.31.0...create-react-native-library@0.31.1) (2023-08-01)

### Bug Fixes

- use `AndroidManifest.xml` for older RN versions ([#431](https://github.com/callstack/react-native-builder-bob/issues/431)) ([ace6101](https://github.com/callstack/react-native-builder-bob/commit/ace61019abcf1b0f1fd8189dfb8791a61ca7b22d)), closes [#429](https://github.com/callstack/react-native-builder-bob/issues/429) - by @satya164

# [0.31.0](https://github.com/callstack/react-native-builder-bob/compare/create-react-native-library@0.30.1...create-react-native-library@0.31.0) (2023-07-12)

### Bug Fixes

- don't use deprecated package field in AndroidManifest on AGP >= 7.3 ([#420](https://github.com/callstack/react-native-builder-bob/issues/420)) ([3846426](https://github.com/callstack/react-native-builder-bob/commit/38464263682b50e6953cd968db2135fb961fd083)) - by @satya164

### Features

- bump node version to 18 ([#418](https://github.com/callstack/react-native-builder-bob/issues/418)) ([7fa4a76](https://github.com/callstack/react-native-builder-bob/commit/7fa4a763a742962db2861dee8be90053b5376270)) - by @atlj

## [0.30.1](https://github.com/callstack/react-native-builder-bob/compare/create-react-native-library@0.30.0...create-react-native-library@0.30.1) (2023-07-04)

### Bug Fixes

- prompt when running init if project already has a config ([83c5332](https://github.com/callstack/react-native-builder-bob/commit/83c5332b82cf1dd8bcc0a3c09faee90ae10aba31)) - by @satya164

# [0.30.0](https://github.com/callstack/react-native-builder-bob/compare/create-react-native-library@0.29.0...create-react-native-library@0.30.0) (2023-07-04)

### Bug Fixes

- add missing method for new arch for backward compatible turbo module ([99e990a](https://github.com/callstack/react-native-builder-bob/commit/99e990a787c98b0c4b6854301257cf726c046eff)), closes [#386](https://github.com/callstack/react-native-builder-bob/issues/386) - by @satya164
- extend @react-native/metro-config for react-native 0.72 ([dcbe447](https://github.com/callstack/react-native-builder-bob/commit/dcbe4476bd1b1f9de79114f89646a2cbc04dfe4e)) - by @satya164
- fix incorrect references in pbxproj. closes [#398](https://github.com/callstack/react-native-builder-bob/issues/398) ([03e8121](https://github.com/callstack/react-native-builder-bob/commit/03e812167c0e006efa333e0af8ec91809ea9c093)) - by @satya164
- update turborepo config to exclude built files ([c69d9b3](https://github.com/callstack/react-native-builder-bob/commit/c69d9b31a8b13159611ad0ebcd4cb477094ccb12)) - by @satya164
- use correct return type for cpp project. closes [#343](https://github.com/callstack/react-native-builder-bob/issues/343) ([6835400](https://github.com/callstack/react-native-builder-bob/commit/6835400a1743f8021e00868807d2e979e0015cce)) - by @satya164

### Features

- **android:** gradle namespace support for AGP versions >7.3 ([#399](https://github.com/callstack/react-native-builder-bob/issues/399)) ([c5cb6c7](https://github.com/callstack/react-native-builder-bob/commit/c5cb6c72e720b016df1ff5205da69431f660b9c2)) - by @atlj
- build ios and android example apps on CI ([325b7ca](https://github.com/callstack/react-native-builder-bob/commit/325b7ca6bd476401f8acf54bc688f6155647dd12)) - by @satya164

# [0.29.0](https://github.com/callstack/react-native-builder-bob/compare/create-react-native-library@0.28.0...create-react-native-library@0.29.0) (2023-06-28)

### Bug Fixes

- android build.gradle typo ([#364](https://github.com/callstack/react-native-builder-bob/issues/364)) ([6582785](https://github.com/callstack/react-native-builder-bob/commit/658278527d7fb121010bb83d6413e9241c990763)) - by @Sunbreak
- don't skip install on ci if package.json files changed ([4f47b38](https://github.com/callstack/react-native-builder-bob/commit/4f47b38d762d385b46a2d49f4eeedc169f9f3c27)) - by @satya164
- Error when creating a package. Error in step `Copying template` … ([#383](https://github.com/callstack/react-native-builder-bob/issues/383)) ([74a70bf](https://github.com/callstack/react-native-builder-bob/commit/74a70bf9ad5705be98ac425022804ba75967626c)), closes [#382](https://github.com/callstack/react-native-builder-bob/issues/382) [#382](https://github.com/callstack/react-native-builder-bob/issues/382) [#382](https://github.com/callstack/react-native-builder-bob/issues/382) - by @dvlkv
- fix package description not being used. closes [#396](https://github.com/callstack/react-native-builder-bob/issues/396) ([47d1370](https://github.com/callstack/react-native-builder-bob/commit/47d1370cf901913fbe4518c7004d170080440b23)) - by @satya164
- typescript 5 compatibility ([#374](https://github.com/callstack/react-native-builder-bob/issues/374)) ([e369644](https://github.com/callstack/react-native-builder-bob/commit/e3696441357ba199557db0289b970e018ca3c5de)), closes [#373](https://github.com/callstack/react-native-builder-bob/issues/373) - by @dcangulo

### Features

- add C files linking to .podspec file template ([#377](https://github.com/callstack/react-native-builder-bob/issues/377)) ([62a762a](https://github.com/callstack/react-native-builder-bob/commit/62a762ad49f29a020a6bd20c3b43da645f9ea466)) - by @krozniata

# [0.28.0](https://github.com/callstack/react-native-builder-bob/compare/create-react-native-library@0.27.3...create-react-native-library@0.28.0) (2023-02-26)

### Bug Fixes

- failure noinspection version for 0.69.4 ([#362](https://github.com/callstack/react-native-builder-bob/issues/362)) ([c203294](https://github.com/callstack/react-native-builder-bob/commit/c203294fc8a40cdee07ba9379860fec6d8f5eb1d)) - by @Sunbreak

### Features

- backport android of new arch project ([da5335e](https://github.com/callstack/react-native-builder-bob/commit/da5335e65e9b6763e372d6422d8582097d11a9f1)) - by @Sunbreak
- backport C++ files of new arch view ([8e42ae9](https://github.com/callstack/react-native-builder-bob/commit/8e42ae91e55469cc782224ffce7cf32b3903a7b5)) - by @Sunbreak
- backport Java/Kotlin files of new arch view ([bf2408a](https://github.com/callstack/react-native-builder-bob/commit/bf2408a16e4e79c7692cf0781aa532e8d26e7450)) - by @Sunbreak
- make year dynamic ([#354](https://github.com/callstack/react-native-builder-bob/issues/354)) ([8795a94](https://github.com/callstack/react-native-builder-bob/commit/8795a94b102068bc50d876b04022b0389ff0a1e3)) - by @dcangulo

## [0.27.3](https://github.com/callstack/react-native-builder-bob/compare/create-react-native-library@0.27.2...create-react-native-library@0.27.3) (2022-12-04)

**Note:** Version bump only for package create-react-native-library

## [0.27.2](https://github.com/callstack/react-native-builder-bob/compare/create-react-native-library@0.27.1...create-react-native-library@0.27.2) (2022-12-02)

### Bug Fixes

- add support for react native 0.71 ([fc87440](https://github.com/callstack/react-native-builder-bob/commit/fc8744092501ba00fd11bdb69e1ecb46fbb63c0f))
- don't use deprecated package for lefthook ([de5b484](https://github.com/callstack/react-native-builder-bob/commit/de5b484b270ef2237161dc210f4d982aaba6637f))
- fetch correct version of packages for web support ([628df24](https://github.com/callstack/react-native-builder-bob/commit/628df24f3e2f7e21a98fb08a0f7322de326d6b91))
- fix typo in equality check ([23f26f5](https://github.com/callstack/react-native-builder-bob/commit/23f26f5202b72b4ddade485246bce08f786a5ed3))
- fix web support in expo example ([1e31449](https://github.com/callstack/react-native-builder-bob/commit/1e31449679503647221412cdb1c80d4d5a2143f4))
- improve error handling. closes [#336](https://github.com/callstack/react-native-builder-bob/issues/336) ([09f6b48](https://github.com/callstack/react-native-builder-bob/commit/09f6b48105dcffb3688d7eed8b4d718e045e65d1))

### Reverts

- Revert "refactor: remove unnecessary config that's added by codegen" ([d18a866](https://github.com/callstack/react-native-builder-bob/commit/d18a866642d086baab1868469ebc618c5636b419))

## [0.27.1](https://github.com/callstack/react-native-builder-bob/compare/create-react-native-library@0.27.0...create-react-native-library@0.27.1) (2022-11-22)

### Bug Fixes

- add missing codegen config for mixed template for iOS ([577fd15](https://github.com/callstack/react-native-builder-bob/commit/577fd152056d09cf895e1293f12f67b99bd6d5c7))
- fix typo in mixed template for iOS ([#331](https://github.com/callstack/react-native-builder-bob/issues/331)) ([f76ca8d](https://github.com/callstack/react-native-builder-bob/commit/f76ca8d42e2a68dcaab068dfa567d733d0a87bb9)), closes [#330](https://github.com/callstack/react-native-builder-bob/issues/330)
- fix typo when checking validity ([5ffd5c5](https://github.com/callstack/react-native-builder-bob/commit/5ffd5c5d98e7151f2a16456e4d58eca677f3bf80))

# [0.27.0](https://github.com/callstack/react-native-builder-bob/compare/create-react-native-library@0.26.0...create-react-native-library@0.27.0) (2022-11-10)

### Bug Fixes

- use npm_config_yes instead of --yes for npm 6 compatibility ([aefa30b](https://github.com/callstack/react-native-builder-bob/commit/aefa30b6f0cacf16e1ed2d5577c6c62dc442f320))
- validate arguments passed to the CLI ([03defcf](https://github.com/callstack/react-native-builder-bob/commit/03defcf22e3b07a09c05eb982db0deb4c0b3845f))

### Features

- add a clean script to cleanup build folders ([6085fd6](https://github.com/callstack/react-native-builder-bob/commit/6085fd60dddac20b8fc87ff86ec469bac7ba8ca8))
- add kotlin support to the fabric template ([ccdb618](https://github.com/callstack/react-native-builder-bob/commit/ccdb618665a4f17d677073d6fba1f71044d3f3a0))

# [0.26.0](https://github.com/callstack/react-native-builder-bob/compare/create-react-native-library@0.25.0...create-react-native-library@0.26.0) (2022-11-03)

### Bug Fixes

- don't hardcode mixed template to run with new architecture ([c397b8b](https://github.com/callstack/react-native-builder-bob/commit/c397b8bb38f6d1d05d95c5ae76079f11d1f1d391))
- fix package folder names ([2436293](https://github.com/callstack/react-native-builder-bob/commit/2436293b75a14c944d9f5a57529b1a4760edc246))
- mention CONTRIBUTING.md after generating the project ([36c1367](https://github.com/callstack/react-native-builder-bob/commit/36c1367194bc9cd5dea4098fa10bf2cd17adfe26))
- mention Java & Swift in CONTRIBUTING.md ([9ec8f64](https://github.com/callstack/react-native-builder-bob/commit/9ec8f64b378e81a07f72e3add57fe9e135f412a6))
- update codegenConfig to the new format ([1212367](https://github.com/callstack/react-native-builder-bob/commit/1212367bad68d59a0c559f2add667d7e18526230))

### Features

- add an option to specify react native version ([5f2a183](https://github.com/callstack/react-native-builder-bob/commit/5f2a18315fd711c3f917d33dc5e0d4fba30b83d1))
- add fabric template ([#273](https://github.com/callstack/react-native-builder-bob/issues/273)) ([c43878f](https://github.com/callstack/react-native-builder-bob/commit/c43878f3410c111bbacaff82fb03e1a6aa5a5b61))
- preserve casing and package namespace ([4993bc9](https://github.com/callstack/react-native-builder-bob/commit/4993bc9d200ea235456214f565184d9fd6dcf95f)), closes [#250](https://github.com/callstack/react-native-builder-bob/issues/250)
- support cpp language with turbo modules ([1b1b68b](https://github.com/callstack/react-native-builder-bob/commit/1b1b68b3dfff77f99caeea8dc0eca2086fc0c6e8))

# [0.25.0](https://github.com/callstack/react-native-builder-bob/compare/create-react-native-library@0.24.4...create-react-native-library@0.25.0) (2022-10-21)

### Features

- add kotlin support to turbo module template ([ad43843](https://github.com/callstack/react-native-builder-bob/commit/ad4384374e0502b071692dec5fd5d3cf7c1b4338))

## [0.24.4](https://github.com/callstack/react-native-builder-bob/compare/create-react-native-library@0.24.3...create-react-native-library@0.24.4) (2022-10-19)

### Bug Fixes

- fix library name not being written to react-native.config.js ([4e05286](https://github.com/callstack/react-native-builder-bob/commit/4e05286d57c6f1a98217d9e860fbee622352ea5f)), closes [#299](https://github.com/callstack/react-native-builder-bob/issues/299) [#300](https://github.com/callstack/react-native-builder-bob/issues/300) [#302](https://github.com/callstack/react-native-builder-bob/issues/302)

## [0.24.3](https://github.com/callstack/react-native-builder-bob/compare/create-react-native-library@0.24.2...create-react-native-library@0.24.3) (2022-10-14)

### Bug Fixes

- restrict engine to latest Node LTS ([f569064](https://github.com/callstack/react-native-builder-bob/commit/f5690640cfca5b3b7c32b98c80442b08fda09150))

## [0.24.2](https://github.com/callstack/react-native-builder-bob/compare/create-react-native-library@0.24.1...create-react-native-library@0.24.2) (2022-10-13)

### Bug Fixes

- use [@latest](https://github.com/latest) for the npx commands ([5a0fbfa](https://github.com/callstack/react-native-builder-bob/commit/5a0fbfacc52ae26254b565ff2a4cf442eaa6ef8d))

## [0.24.1](https://github.com/callstack/react-native-builder-bob/compare/create-react-native-library@0.24.0...create-react-native-library@0.24.1) (2022-10-13)

### Bug Fixes

- use index.js instead of index.ts ([1393499](https://github.com/callstack/react-native-builder-bob/commit/1393499fab8a282f09fec68ccf10b52517581c1e)), closes [#281](https://github.com/callstack/react-native-builder-bob/issues/281)

# [0.24.0](https://github.com/callstack/react-native-builder-bob/compare/create-react-native-library@0.23.3...create-react-native-library@0.24.0) (2022-10-13)

### Bug Fixes

- exclude some unnecessary files from the package ([0213adc](https://github.com/callstack/react-native-builder-bob/commit/0213adccf8cff279b6953f503bdc04db1d72437f))
- fix types in cpp adapter. closes [#278](https://github.com/callstack/react-native-builder-bob/issues/278) ([2c572dd](https://github.com/callstack/react-native-builder-bob/commit/2c572dd9b8eac5a494ed3c39dc7f1f453d08c7ed))
- remove babel-eslint parser due to lack of support for typescript ([#274](https://github.com/callstack/react-native-builder-bob/issues/274)) ([7a0c0e9](https://github.com/callstack/react-native-builder-bob/commit/7a0c0e9794c741b6dc0a43b65bb98ef513c41f4b))
- show a helpful error if npx isn't installed ([2c3b5e4](https://github.com/callstack/react-native-builder-bob/commit/2c3b5e4464ceca56c5dd8e51f3f29ab3c7ba08a8))

### Features

- **ios:** enable function generation by Xcode with CodeGen interface ([#267](https://github.com/callstack/react-native-builder-bob/issues/267)) ([b152ccf](https://github.com/callstack/react-native-builder-bob/commit/b152ccf4ba0aa9aabf9697506b45ac2c4e75a1c1)), closes [#261](https://github.com/callstack/react-native-builder-bob/issues/261)
- use react-native init for generating example app ([#271](https://github.com/callstack/react-native-builder-bob/issues/271)) ([ac0e2f7](https://github.com/callstack/react-native-builder-bob/commit/ac0e2f79ed292b92341a00e73ab6395c9ad8e0d2))

## [0.23.3](https://github.com/callstack/react-native-builder-bob/compare/create-react-native-library@0.23.2...create-react-native-library@0.23.3) (2022-08-01)

### Bug Fixes

- remove explicit folly version ([b35432e](https://github.com/callstack/react-native-builder-bob/commit/b35432e2b7c8149be2eb9eba20e2c3efd86b899e))

## [0.23.2](https://github.com/callstack/react-native-builder-bob/compare/create-react-native-library@0.23.1...create-react-native-library@0.23.2) (2022-07-09)

### Bug Fixes

- update ‘js’ value type to new value ‘library’ in create library script ([#253](https://github.com/callstack/react-native-builder-bob/issues/253)) ([5599ee6](https://github.com/callstack/react-native-builder-bob/commit/5599ee63cafb0e39d238d38bd58734b40ca001aa))

## [0.23.1](https://github.com/callstack/react-native-builder-bob/compare/create-react-native-library@0.23.0...create-react-native-library@0.23.1) (2022-07-04)

### Bug Fixes

- use correct bob version in package.json ([4a5afb3](https://github.com/callstack/react-native-builder-bob/commit/4a5afb3ea1ebdf9febe0a3822cbabaa32d0a4faf))

# [0.23.0](https://github.com/callstack/react-native-builder-bob/compare/create-react-native-library@0.22.0...create-react-native-library@0.23.0) (2022-06-30)

### Features

- update turbo modules template to use a synchronous API ([1393060](https://github.com/callstack/react-native-builder-bob/commit/1393060e5f36dd4d43b53603d9cf7f814b8ce94b))

# [0.22.0](https://github.com/callstack/react-native-builder-bob/compare/create-react-native-library@0.21.1...create-react-native-library@0.22.0) (2022-06-27)

### Features

- add a template for turbo module (experimental) ([cc95a72](https://github.com/callstack/react-native-builder-bob/commit/cc95a726f8019e016cebde76c0de15986eb79c64))

## [0.21.1](https://github.com/callstack/react-native-builder-bob/compare/create-react-native-library@0.21.0...create-react-native-library@0.21.1) (2022-06-22)

### Bug Fixes

- fix generated package name ([09e63a9](https://github.com/callstack/react-native-builder-bob/commit/09e63a9f00821e2e67b301a62e61e7f8175c3e4a))

# [0.21.0](https://github.com/callstack/react-native-builder-bob/compare/create-react-native-library@0.20.1...create-react-native-library@0.21.0) (2022-06-21)

### Bug Fixes

- consolidate gradle files ([af0ae13](https://github.com/callstack/react-native-builder-bob/commit/af0ae134d4a122f2ec0d08bda0572718e2f72174))
- fix requiresMainQueueSetup warning for swift modules ([31cf29f](https://github.com/callstack/react-native-builder-bob/commit/31cf29fa6998563fe7f39c057039220249922998))
- fixed lint throw error without semicolon ([#232](https://github.com/callstack/react-native-builder-bob/issues/232)) ([45c138b](https://github.com/callstack/react-native-builder-bob/commit/45c138bd0ed0e950fbfc2dd15a4f7d601bbab7ee))
- include header with project identifier for cpp ([#246](https://github.com/callstack/react-native-builder-bob/issues/246)) ([2aba2be](https://github.com/callstack/react-native-builder-bob/commit/2aba2be319a2ab3b6e618886306f7e5712bc8b9f))
- remove double-quoted imports from React-Core ([#220](https://github.com/callstack/react-native-builder-bob/issues/220)) ([0de461d](https://github.com/callstack/react-native-builder-bob/commit/0de461d32bf5a74a3c91f0d2aa860f429f369d54))
- use react-native.config.js for linking the library ([1000cd7](https://github.com/callstack/react-native-builder-bob/commit/1000cd7c4d99647f4ad2e90cfcc5874697e270aa))

### Features

- enable hermes by default ([194e279](https://github.com/callstack/react-native-builder-bob/commit/194e2793244f92a3cf2a606e6077a9978a0679e1))
- migrate to lefthook instead of husky ([c3e4bfb](https://github.com/callstack/react-native-builder-bob/commit/c3e4bfb9c6db97b8fbbdc24aa2d10a0b41c9de4d))
- upgrade templates to latest react & react-native ([9bb2a22](https://github.com/callstack/react-native-builder-bob/commit/9bb2a223b0957239db3cc09fc89269ab68fefc0b))

## [0.20.1](https://github.com/callstack/react-native-builder-bob/compare/create-react-native-library@0.20.0...create-react-native-library@0.20.1) (2021-10-15)

### Bug Fixes

- fix cpp template ([#203](https://github.com/callstack/react-native-builder-bob/issues/203)) ([15a82b0](https://github.com/callstack/react-native-builder-bob/commit/15a82b00c4e9a98f467a7b48dccd4551c8da1c3e))

# [0.20.0](https://github.com/callstack/react-native-builder-bob/compare/create-react-native-library@0.19.0...create-react-native-library@0.20.0) (2021-09-28)

### Bug Fixes

- **android:** prefer downloading dependencies from Maven Central ([#198](https://github.com/callstack/react-native-builder-bob/issues/198)) ([ecea932](https://github.com/callstack/react-native-builder-bob/commit/ecea932b52011378db35a223023097fa11ed651e))
- can't run yarn command under Windows ([8bac4d4](https://github.com/callstack/react-native-builder-bob/commit/8bac4d4690a0ba2576e9b83b00be92061ba796e3))
- fix generating cpp project on iOS ([75a4a3c](https://github.com/callstack/react-native-builder-bob/commit/75a4a3cf1b7d5f3c2b14f2f3a20c0be72250a119))
- wrong package name of ReactNativeFlipper ([#161](https://github.com/callstack/react-native-builder-bob/issues/161)) ([981448d](https://github.com/callstack/react-native-builder-bob/commit/981448db9970e42521661a5b6e54fd71fe3390ef))

### Features

- print an error when library is not linked ([#202](https://github.com/callstack/react-native-builder-bob/issues/202)) ([956ffd6](https://github.com/callstack/react-native-builder-bob/commit/956ffd60a6b4132a81494e1599b52e5aee232111))
- update expo sdk version to 42 ([#192](https://github.com/callstack/react-native-builder-bob/issues/192)) ([6276f59](https://github.com/callstack/react-native-builder-bob/commit/6276f59001cb92840a421de6bd01b41697ef1222))
- upgrade husky to v6 ([a78b9d1](https://github.com/callstack/react-native-builder-bob/commit/a78b9d147a2a2d1c42f050c60f808855bb97bc24))

# [0.19.0](https://github.com/callstack/react-native-builder-bob/compare/create-react-native-library@0.18.1...create-react-native-library@0.19.0) (2021-04-06)

### Bug Fixes

- fallback bob version ([#147](https://github.com/callstack/react-native-builder-bob/issues/147)) ([47fdd6b](https://github.com/callstack/react-native-builder-bob/commit/47fdd6bd914f3682b32d5ebd5b7a21d1433f7337))
- fix missing semicolon in babel config ([#142](https://github.com/callstack/react-native-builder-bob/issues/142)) ([b552564](https://github.com/callstack/react-native-builder-bob/commit/b552564a0daaee88001c030b300feb57e7b2fcdb))
- hardcode flipper version. fixes [#144](https://github.com/callstack/react-native-builder-bob/issues/144) ([eb93059](https://github.com/callstack/react-native-builder-bob/commit/eb93059f5ce996139654876a8d08c1081b99ee83))
- update docs with more info ([670ed10](https://github.com/callstack/react-native-builder-bob/commit/670ed10c7faf746e284409ed32d723f00f8a5867))

### Features

- add support for Java templates ([#129](https://github.com/callstack/react-native-builder-bob/issues/129)) ([e3a4c2d](https://github.com/callstack/react-native-builder-bob/commit/e3a4c2def1358240d2ac8f647503904950b2fb9b))

## [0.18.1](https://github.com/callstack/react-native-builder-bob/compare/create-react-native-library@0.18.0...create-react-native-library@0.18.1) (2021-03-03)

**Note:** Version bump only for package create-react-native-library

# 0.18.0 (2021-03-02)

**Note:** Version bump only for package create-react-native-library

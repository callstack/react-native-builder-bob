import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import fs from 'fs-extra';
import mockfs from 'mock-fs';
import path from 'node:path';
import { removeCodegenAppLevelCode } from './removeCodegenAppLevelCode.ts';

const mockPackageJson = {
  codegenConfig: {
    outputDir: {
      android: 'android/generated',
      ios: 'ios/generated',
    },
  },
};

const mockProjectPath = path.resolve(__dirname, 'mockProject');

describe('patchCodegenAndroidPackage', () => {
  beforeEach(() => {
    mockfs({
      [mockProjectPath]: {
        'package.json': JSON.stringify(mockPackageJson),
        'ios': {
          generated: {
            'RCTAppDependencyProvider.h': '',
            'RCTAppDependencyProvider.mm': '',
            'RCTModulesConformingToProtocolsProvider.h': '',
            'RCTModulesConformingToProtocolsProvider.mm': '',
            'RCTThirdPartyComponentsProvider.h': '',
            'RCTThirdPartyComponentsProvider.mm': '',
            'ReactAppDependencyProvider.podspec': '',
          },
        },
        'android': {
          generated: {
            'RCTAppDependencyProvider.h': '',
            'RCTAppDependencyProvider.mm': '',
            'RCTModulesConformingToProtocolsProvider.h': '',
            'RCTModulesConformingToProtocolsProvider.mm': '',
            'RCTThirdPartyComponentsProvider.h': '',
            'RCTThirdPartyComponentsProvider.mm': '',
            'ReactAppDependencyProvider.podspec': '',
          },
        },
      },
    });
  });

  afterEach(() => {
    mockfs.restore();
  });

  test('removes the duplicate iOS files', async () => {
    await removeCodegenAppLevelCode(mockProjectPath, mockPackageJson);

    expect(
      (
        await fs.promises.readdir(
          path.join(mockProjectPath, 'ios', 'generated')
        )
      ).length
    ).toBe(0);
  });

  test('removes the unnecessary Android files', async () => {
    await removeCodegenAppLevelCode(mockProjectPath, mockPackageJson);

    expect(
      (
        await fs.promises.readdir(
          path.join(mockProjectPath, 'android', 'generated')
        )
      ).length
    ).toBe(0);
  });

  test("doesn't crash the process when there are no files to remove", async () => {
    mockfs({
      [mockProjectPath]: {
        'package.json': JSON.stringify(mockPackageJson),
        'ios': {
          generated: {
            someRandomFile: '',
          },
        },
        'android': {
          generated: {
            someRandomFile: '',
          },
        },
      },
    });

    await expect(
      removeCodegenAppLevelCode(mockProjectPath, mockPackageJson)
    ).resolves.not.toThrow();
  });
});

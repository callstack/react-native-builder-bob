import { expect, it, describe, beforeEach, afterEach } from '@jest/globals';
import fs from 'fs-extra';
import path from 'node:path';
import { removeCodegenAppLevelCode } from './removeCodegenAppLevelCode';
import mockfs from 'mock-fs';

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

  it('removes the duplicate iOS files', async () => {
    await removeCodegenAppLevelCode(mockProjectPath, mockPackageJson);

    expect(
      (
        await fs.promises.readdir(
          path.join(mockProjectPath, 'ios', 'generated')
        )
      ).length
    ).toBe(0);
  });

  it('removes the unnecessary Android files', async () => {
    await removeCodegenAppLevelCode(mockProjectPath, mockPackageJson);

    expect(
      (
        await fs.promises.readdir(
          path.join(mockProjectPath, 'android', 'generated')
        )
      ).length
    ).toBe(0);
  });

  it("doesn't crash the process when there are no files to remove", async () => {
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

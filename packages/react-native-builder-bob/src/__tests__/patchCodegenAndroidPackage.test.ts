import { expect, it, describe, beforeEach, afterEach } from '@jest/globals';
import fs from 'fs-extra';
import path from 'node:path';
import { patchCodegenAndroidPackage } from '../utils/patchCodegenAndroidPackage';
import mockfs from 'mock-fs';
import type { Report } from '../types';

const mockPackageJson = {
  codegenConfig: {
    outputDir: {
      android: 'android/generated',
    },
    android: {
      javaPackageName: 'com.bobtest',
    },
  },
};

const mockReport: Report = {
  info: console.log,
  warn: console.log,
  error: console.log,
  success: console.log,
};

const mockJavaSpec = `
/**
 * Some comment
 */

package com.bobtest;

import com.example.exampleimport;

class SomeClass {
  public void someMethod() {
    // some code
  }
}`;

const mockProjectPath = path.resolve(__dirname, 'mockProject');
const mockCodegenSpecsPath = path.resolve(
  mockProjectPath,
  'android/generated/java/com/facebook/fbreact/specs'
);

describe('patchCodegenAndroidPackage', () => {
  beforeEach(() => {
    mockfs({
      [mockProjectPath]: {
        'package.json': JSON.stringify(mockPackageJson),
      },
      [mockCodegenSpecsPath]: {
        'NativeBobtestSpec.java': mockJavaSpec,
      },
    });
  });

  afterEach(() => {
    mockfs.restore();
  });

  it('moves the files to correct dir', async () => {
    await patchCodegenAndroidPackage(mockProjectPath, mockPackageJson, mockReport);

    const expectedDir = path.resolve(
      mockProjectPath,
      'android/generated/java/com/bobtest'
    );

    expect(await fs.pathExists(expectedDir)).toBe(true);
  });

  it('replaces the package name in the files', async () => {
    await patchCodegenAndroidPackage(mockProjectPath, mockPackageJson, mockReport);

    const expectedDir = path.resolve(
      mockProjectPath,
      'android/generated/java/com/bobtest'
    );

    const expectedFile = path.resolve(expectedDir, 'NativeBobtestSpec.java');

    const fileContent = await fs.readFile(expectedFile, 'utf8');

    expect(fileContent).toContain('package com.bobtest;');
  });

  it('removes the old package dir', async () => {
    await patchCodegenAndroidPackage(mockProjectPath, mockPackageJson, mockReport);

    expect(await fs.pathExists(mockCodegenSpecsPath)).toBe(false);
  });
});

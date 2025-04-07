import { expect, test, describe, beforeEach, afterEach } from 'vitest';
import fs from 'fs-extra';
import path from 'node:path';
import { patchCodegenAndroidPackage } from './patchCodegenAndroidPackage';
import mockfs from 'mock-fs';
import type { Report } from '../../../types';

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
  error: console.error,
  success: console.log,
};

const mockJavaModuleSpec = `
/**
 * Some comment
 */

package com.facebook.fbreact.specs;

import com.example.exampleimport;

class SomeClass {
  public void someMethod() {
    // some code
  }
}`;

const mockJavaViewSpec = `
/**
  * Some comment
  */

package com.facebook.react.viewmanagers;

public interface SomeInterface<T extends View> {
  void setColor(T view, @Nullable String value);
}
`;

const mockProjectPath = path.resolve(__dirname, 'mockProject');
const mockCodegenModuleSpecsPath = path.resolve(
  mockProjectPath,
  'android/generated/java/com/facebook/fbreact/specs'
);
const mockCodegenViewSpecsPath = path.resolve(
  mockProjectPath,
  'android/generated/java/com/facebook/react/viewmanagers'
);

describe('patchCodegenAndroidPackage', () => {
  beforeEach(() => {
    mockfs({
      [mockProjectPath]: {
        'package.json': JSON.stringify(mockPackageJson),
      },
      [mockCodegenModuleSpecsPath]: {
        'NativeBobtestSpec.java': mockJavaModuleSpec,
      },
    });
  });

  afterEach(() => {
    mockfs.restore();
  });

  test('moves the files to correct dir', async () => {
    await patchCodegenAndroidPackage(
      mockProjectPath,
      mockPackageJson,
      mockReport
    );

    const expectedDir = path.resolve(
      mockProjectPath,
      'android/generated/java/com/bobtest'
    );

    expect(await fs.pathExists(expectedDir)).toBe(true);
  });

  test('replaces the package name in the files', async () => {
    await patchCodegenAndroidPackage(
      mockProjectPath,
      mockPackageJson,
      mockReport
    );

    const expectedDir = path.resolve(
      mockProjectPath,
      'android/generated/java/com/bobtest'
    );

    const expectedFile = path.resolve(expectedDir, 'NativeBobtestSpec.java');

    const fileContent = await fs.readFile(expectedFile, 'utf8');

    expect(fileContent).toContain('package com.bobtest;');
  });

  test('removes the old package dir', async () => {
    await patchCodegenAndroidPackage(
      mockProjectPath,
      mockPackageJson,
      mockReport
    );

    expect(await fs.pathExists(mockCodegenModuleSpecsPath)).toBe(false);
  });

  test("doesn't delete the view manager specs", async () => {
    const mockPackageJsonWithTypeAll = {
      ...mockPackageJson,
      codegenConfig: {
        ...mockPackageJson.codegenConfig,
        type: 'all',
      },
    };

    mockfs({
      [mockProjectPath]: {
        'package.json': JSON.stringify(mockPackageJsonWithTypeAll),
      },
      [mockCodegenModuleSpecsPath]: {
        'NativeBobtestSpec.java': mockJavaModuleSpec,
      },
      [mockCodegenViewSpecsPath]: {
        'BobtestViewManagerInterface.java': mockJavaViewSpec,
      },
    });

    await patchCodegenAndroidPackage(
      mockProjectPath,
      mockPackageJsonWithTypeAll,
      mockReport
    );

    expect(
      await fs.pathExists(
        path.join(mockCodegenViewSpecsPath, 'BobtestViewManagerInterface.java')
      )
    ).toBeTruthy();
  });
});

#!/usr/bin/env node

import { execFileSync, execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

type Change = { from: string; to: string };
type PackageJson = { devDependencies?: Record<string, string> };

const ROOT_DIR = path.resolve(import.meta.dirname, '..');
const CRNL_DIR = path.join(ROOT_DIR, 'packages/create-react-native-library');
const TEMPLATES_DIR = path.join(CRNL_DIR, 'templates');
const BIN_PATH = path.join(CRNL_DIR, 'bin/create-react-native-library');

// These are tied to the React Native release and can't be upgraded independently
const IGNORED_PACKAGES = [
  'react',
  '@types/react',
  'react-native',
  /^@react-native\//,
];

function readDevDependencies(filePath: string) {
  const pkg = JSON.parse(fs.readFileSync(filePath, 'utf8')) as PackageJson;

  return pkg.devDependencies ?? {};
}

function isIgnoredPackage(name: string) {
  return IGNORED_PACKAGES.some((pkg) =>
    typeof pkg === 'string' ? pkg === name : pkg.test(name)
  );
}

function getDependencyChanges(
  generatedDeps: Record<string, string>,
  ncuDeps: Record<string, string>
) {
  const changes: Record<string, Change> = {};

  for (const [name, ncuVersion] of Object.entries(ncuDeps)) {
    if (isIgnoredPackage(name)) {
      // Sync the CLI-generated version back to the template, not the ncu upgrade.
      // updateDeps will skip if the template already has this version.
      changes[name] = { from: '', to: generatedDeps[name] ?? ncuVersion };
    } else if (generatedDeps[name] !== ncuVersion) {
      changes[name] = { from: generatedDeps[name] ?? '', to: ncuVersion };
    }
  }

  return changes;
}

function getTemplatePackageFiles() {
  return [
    path.join(TEMPLATES_DIR, 'common', '$package.json'),
    ...fs
      .readdirSync(path.join(TEMPLATES_DIR, 'tools'))
      .flatMap((dir) => [
        path.join(TEMPLATES_DIR, 'tools', dir, '~package.json'),
        path.join(TEMPLATES_DIR, 'tools', dir, 'example', '~package.json'),
      ])
      .filter((filePath) => fs.existsSync(filePath)),
  ];
}

function updateDeps(filePath: string, changes: Record<string, Change>) {
  const replacements = Object.entries(changes).map(([name, { to }]) => {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    return {
      regex: new RegExp(`("${escaped}":\\s*)"([^"]*)"`),
      to,
    };
  });

  const content = fs.readFileSync(filePath, 'utf8');
  let inDepSection = false;

  const updated = content
    .split('\n')
    .map((line) => {
      if (
        line.includes('"dependencies"') ||
        line.includes('"devDependencies"')
      ) {
        inDepSection = true;
      } else if (inDepSection && /^\s*[}\]]/.test(line)) {
        inDepSection = false;
      }

      if (!inDepSection || line.includes('<%')) {
        return line;
      }

      for (const { regex, to } of replacements) {
        line = line.replace(regex, `$1"${to}"`);
      }

      return line;
    })
    .join('\n');

  if (updated !== content) {
    fs.writeFileSync(filePath, updated);
    console.log(`Updated: ${path.relative(CRNL_DIR, filePath)}`);
  }
}

function main() {
  console.log('Building create-react-native-library...');

  execSync('yarn workspace create-react-native-library prepare', {
    cwd: ROOT_DIR,
    stdio: 'inherit',
  });

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'crnl-upgrade-'));
  const libDir = path.join(tmpDir, 'bob-upgrade-test');

  console.log(`\nGenerating library in ${tmpDir}...`);

  execFileSync(
    process.execPath,
    [
      BIN_PATH,
      'bob-upgrade-test',
      '--description',
      'test',
      '--type',
      'turbo-module',
      '--languages',
      'kotlin-objc',
      '--example',
      'vanilla',
      '--yes',
    ],
    {
      cwd: tmpDir,
      stdio: 'inherit',
    }
  );

  const pkgPath = path.join(libDir, 'package.json');
  const generatedDeps = readDevDependencies(pkgPath);

  console.log('\nChecking for dependency upgrades...');

  execSync('npx npm-check-updates -u', {
    cwd: libDir,
    stdio: 'inherit',
  });

  const ncuDeps = readDevDependencies(pkgPath);
  const changes = getDependencyChanges(generatedDeps, ncuDeps);

  if (Object.keys(changes).length === 0) {
    console.log('\nAll dependencies are up to date.');
    return;
  }

  const upgrades = Object.entries(changes).filter(([, { from }]) => from);

  if (upgrades.length > 0) {
    console.log('\nDependencies to upgrade:');

    for (const [name, { from, to }] of upgrades) {
      console.log(`  ${name}: ${from} -> ${to}`);
    }
  }

  const filesToUpdate = getTemplatePackageFiles();

  for (const file of filesToUpdate) {
    updateDeps(file, changes);
  }

  console.log('\nDone!');
}

main();

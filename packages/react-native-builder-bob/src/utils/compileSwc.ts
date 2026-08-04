import path from 'node:path';
import { transform, type ParserConfig } from '@swc/core';
import browserslist from 'browserslist';
import targets from '../configs/default-targets.cjs';
import { rewriteModuleSpecifiersInSource } from './rewriteModuleSpecifiersInSource.ts';

type Options = {
  code: string;
  filepath: string;
  outputFilename: string;
  root: string;
  source: string;
  modules: 'commonjs' | 'preserve';
  esm: boolean;
  sourceMaps: boolean;
  jsxRuntime: 'automatic' | 'classic';
  codegenEnabled: boolean;
};

export async function compileSwc({
  code,
  filepath,
  outputFilename,
  root,
  source,
  modules,
  esm,
  sourceMaps,
  jsxRuntime,
  codegenEnabled,
}: Options) {
  let parser: ParserConfig;

  switch (path.extname(filepath)) {
    case '.ts':
    case '.mts':
    case '.cts':
      parser = { syntax: 'typescript' };
      break;
    case '.tsx':
      parser = { syntax: 'typescript', tsx: true };
      break;
    default:
      parser = { syntax: 'ecmascript', jsx: true };
  }

  const sourceFileName = path.relative(source, filepath);
  const rewritten = rewriteModuleSpecifiersInSource({
    code,
    filepath,
    sourceFileName,
    extension: esm ? 'js' : undefined,
    sourceMaps,
    codegenEnabled,
  });
  const browserslistConfig = browserslist.loadConfig({ path: root });
  const preserveModules = /\.m[jt]s$/.test(filepath) || modules === 'preserve';
  return transform(rewritten.code, {
    cwd: root,
    filename: filepath,
    swcrc: false,
    configFile: false,
    sourceMaps,
    inlineSourcesContent: false,
    inputSourceMap: rewritten.sourceMap,
    sourceRoot: path.relative(path.dirname(outputFilename), source),
    sourceFileName,
    outputPath: outputFilename,
    isModule: 'unknown',
    env: {
      targets: browserslistConfig ?? targets.browserslist,
    },
    jsc: {
      parser,
      transform: {
        react: {
          runtime: jsxRuntime,
        },
      },
    },
    module: preserveModules
      ? {
          type: 'es6',
          strictMode: true,
        }
      : {
          type: 'commonjs',
          importInterop: 'babel',
          strictMode: true,
        },
  });
}

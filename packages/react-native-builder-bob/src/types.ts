export type Log = (message: string) => void;
export type Report = {
  info: Log;
  warn: Log;
  success: Log;
  error: Log;
};

export type Input = {
  root: string;
  source: string;
  output: string;
  report: Report;
};

export type Target =
  | 'commonjs'
  | 'module'
  | 'typescript'
  | 'codegen'
  | 'custom';

export type Options = {
  source?: string;
  output?: string;
  targets?: (Target | [target: Target, options: object])[];
  exclude?: string;
};

declare module '@babel/core' {
  export interface TransformCaller {
    rewriteImportExtensions: boolean;
    jsxRuntime: 'automatic' | 'classic';
    codegenEnabled: boolean;
  }
}

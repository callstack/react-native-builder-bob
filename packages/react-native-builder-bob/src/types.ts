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

export type Variants = {
  commonjs?: boolean;
  module?: boolean;
};

declare module '@babel/core' {
  export interface TransformCaller {
    rewriteImportExtensions: boolean;
    jsxRuntime: 'automatic' | 'classic';
    codegenEnabled: boolean;
  }
}

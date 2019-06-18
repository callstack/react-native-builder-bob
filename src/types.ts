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

export type Target = 'aar' | 'commonjs' | 'module' | 'typescript';

export type Options = {
  source?: string;
  output?: string;
  targets?: Array<Target | [Target, object]>;
};

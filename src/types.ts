export type Log = (message: string) => void;

export type Input = {
  root: string;
  source: string;
  output: string;
  report: {
    info: Log;
    warn: Log;
    success: Log;
    error: Log;
  };
};

export type Target = 'commonjs' | 'module' | 'typescript';

export type Options = {
  source?: string;
  output?: string;
  targets?: Array<Target | [Target, object]>;
};

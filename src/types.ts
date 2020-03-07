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
  targets?: (Target | [Target, object])[];
};

export type ProjectOptions = {
  bob: {
    version: string;
  };
  project: {
    slug: string;
    description: string;
    name: string;
    package: string;
    podspec: string;
    includeNative: boolean;
  };
  author: {
    name: string;
    email: string;
    url: string;
  };
  repo: string;
};

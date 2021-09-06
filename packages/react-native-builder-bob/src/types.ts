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
  watch?: boolean;
};

export type Target = 'aar' | 'commonjs' | 'module' | 'typescript';

export type ModuleTargetOptions = {
  babelrc?: boolean;
  configFile?: string | false;
  copyFlow?: boolean;
};

export type CJSTargetOptions = ModuleTargetOptions;

export type TSTargetOptions = {
  project?: string;
  tsc?: string;
};

export type AARTargetOptions = {
  androidPath: string;
  androidBundleName: string;
  reverseJetify: boolean;
};

export type TargetOptions = ModuleTargetOptions | TSTargetOptions;

export type Options = {
  source?: string;
  output?: string;
  targets?: (Target | [Target, TargetOptions])[];
};

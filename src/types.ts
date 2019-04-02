export type Input = {
  root: string,
  source: string,
  output: string,
};

export type Target = 'commonjs' | 'module' | 'typescript';

export type Options = {
  source?: string,
  output?: string,
  targets?: Array<Target | [Target, object]>
}

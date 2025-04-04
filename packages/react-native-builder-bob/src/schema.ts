import { type } from 'arktype';

const module = {
  name: '"module"',
  options: type({
    esm: type('boolean').default(false),
    babelrc: type('boolean').default(false),
    configFile: type('boolean').default(false),
    sourceMaps: type('boolean').default(true),
    copyFlow: type('boolean').default(false),
    jsxRuntime: type('"automatic" | "classic"').default('automatic'),
  }),
} as const;

const commonjs = {
  name: '"commonjs"',
  options: module.options,
} as const;

const typescript = {
  name: '"typescript"',
  options: type({
    project: 'string?',
    tsc: 'string?',
  }),
} as const;

const codegen = {
  name: '"codegen"',
} as const;

const custom = {
  name: '"custom"',
  options: type({
    script: 'string',
    clean: 'string?',
  }),
} as const;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const target = type.or(
  commonjs.name,
  module.name,
  typescript.name,
  codegen.name,
  custom.name
);

export const config = type({
  source: 'string',
  output: 'string',
  targets: type
    .or(
      type.or(module.name, [module.name], [module.name, module.options]),
      type.or(
        commonjs.name,
        [commonjs.name],
        [commonjs.name, commonjs.options]
      ),
      type.or(
        typescript.name,
        [typescript.name],
        [typescript.name, typescript.options]
      ),
      type.or(codegen.name, [codegen.name]),
      [custom.name, custom.options]
    )
    .array()
    .moreThanLength(0),
  exclude: type.string.default('**/{__tests__,__fixtures__,__mocks__}/**'),
}).onDeepUndeclaredKey('reject');

export type Config = typeof config.infer;

export type Target = typeof target.infer;

export type TargetOptions<T extends Target> = T extends typeof commonjs.name
  ? typeof commonjs.options.infer
  : T extends typeof module.name
  ? typeof module.options.infer
  : T extends typeof typescript.name
  ? typeof typescript.options.infer
  : T extends typeof custom.name
  ? typeof custom.options.infer
  : T extends typeof codegen.name
  ? undefined
  : never;

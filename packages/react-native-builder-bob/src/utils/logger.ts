import chalk from 'chalk';

const logger =
  (type: string, color: Function) =>
  (...messages: unknown[]) => {
    console.log(color(chalk.bold(type)), ...messages);
  };

export const info = logger('ℹ', chalk.blue);
export const warn = logger('⚠', chalk.yellow);
export const error = logger('✖', chalk.red);
export const success = logger('✔', chalk.green);

export const exit = (...messages: unknown[]) => {
  error(...messages);
  process.exit(1);
};

import chalk from 'chalk';

const logger = (type: string, color: Function) => (...messages: unknown[]) => {
  console.log(color(`[${type}]`), ...messages);
};

export const info = logger('info', chalk.blue);
export const warn = logger('warn', chalk.yellow);
export const error = logger('error', chalk.red);

export const exit = (...messages: unknown[]) => {
  error(...messages);
  process.exit(1);
};

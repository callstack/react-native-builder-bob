import kleur from 'kleur';

const logger =
  (type: string, color: Function) =>
  (...messages: unknown[]) => {
    console.log(color(kleur.bold(type)), ...messages);
  };

export const info = logger('ℹ', kleur.blue);
export const warn = logger('⚠', kleur.yellow);
export const error = logger('✖', kleur.red);
export const success = logger('✔', kleur.green);

export const exit = (...messages: unknown[]) => {
  error(...messages);
  process.exit(1);
};

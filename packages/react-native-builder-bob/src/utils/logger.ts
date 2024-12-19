import kleur from 'kleur';

const logger =
  (
    type: string,
    color: kleur.Color,
    stream: NodeJS.WriteStream = process.stdout
  ) =>
  (...messages: unknown[]) => {
    const message = `${color(kleur.bold(type))} ${messages
      .map((message) => {
        if (typeof message === 'string') {
          return message.split('\n').join(`\n  `);
        } else {
          return message;
        }
      })
      .join(' ')}`;

    stream.write(message + '\n');
  };

export const info = logger('ℹ', kleur.blue);
export const warn = logger('⚠', kleur.yellow);
export const error = logger('✖', kleur.red, process.stderr);
export const success = logger('✔', kleur.green);

export const exit = (...messages: unknown[]) => {
  error(...messages);
  process.exit(1);
};

import kleur from 'kleur';

const logger =
  (
    type: string,
    color: kleur.Color,
    group?: string,
    stream: NodeJS.WriteStream = process.stdout
  ) =>
  (...messages: unknown[]) => {
    if (group) {
      messages.unshift(
        `${kleur.gray('[')}${kleur.blue(group)}${kleur.gray(']')}`
      );
    }

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
export const error = logger('✖', kleur.red, undefined, process.stderr);
export const success = logger('✔', kleur.green);

export const grouped = (label: string) => {
  return {
    info: logger('ℹ', kleur.blue, label),
    warn: logger('⚠', kleur.yellow, label),
    error: logger('✖', kleur.red, label, process.stderr),
    success: logger('✔', kleur.green, label),
  };
};

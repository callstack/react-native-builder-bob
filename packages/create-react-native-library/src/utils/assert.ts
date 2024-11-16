import kleur from 'kleur';
import { spawn } from './spawn';
import type { Answers, Args, Question } from '../input';

export async function assertNpxExists() {
  try {
    await spawn('npx', ['--help']);
  } catch (error) {
    // @ts-expect-error: TS doesn't know about `code`
    if (error != null && error.code === 'ENOENT') {
      console.log(
        `Couldn't find ${kleur.blue(
          'npx'
        )}! Please install it by running ${kleur.blue('npm install -g npx')}`
      );

      process.exit(1);
    } else {
      throw error;
    }
  }
}

/**
 * Makes sure the answers are in expected form and ends the process with error if they are not
 */
export function assertUserInput(
  questions: Question[],
  answers: Answers | Args
) {
  for (const [key, value] of Object.entries(answers)) {
    if (value == null) {
      continue;
    }

    const question = questions.find((q) => q.name === key);

    if (question == null) {
      continue;
    }

    let valid = question.validate ? question.validate(String(value)) : true;

    // We also need to guard against invalid choices
    // If we don't already have a validation message to provide a better error
    if (typeof valid !== 'string' && 'choices' in question) {
      const choices =
        typeof question.choices === 'function'
          ? question.choices(
              undefined,
              // @ts-expect-error: it complains about optional values, but it should be fine
              answers,
              question
            )
          : question.choices;

      if (choices && !choices.some((choice) => choice.value === value)) {
        valid = `Supported values are - ${choices.map((c) =>
          kleur.green(c.value)
        )}`;
      }
    }

    if (valid !== true) {
      let message = `Invalid value ${kleur.red(
        String(value)
      )} passed for ${kleur.blue(key)}`;

      if (typeof valid === 'string') {
        message += `: ${valid}`;
      }

      console.log(message);

      process.exit(1);
    }
  }
}

import kleur from 'kleur';
import { spawn } from './spawn.ts';
import type { Answers, Args } from '../input.ts';
import type { Question } from './prompt.ts';

export async function assertNpxExists() {
  try {
    await spawn('npx', ['--help']);
  } catch (error) {
    // @ts-expect-error: TS doesn't know about `code`
    if (error != null && error.code === 'ENOENT') {
      throw new Error(
        `Couldn't find ${kleur.blue(
          'npx'
        )}! Please install it by running ${kleur.blue('npm install -g npx')}`
      );
    } else {
      throw error;
    }
  }
}

/**
 * Makes sure the answers are in expected form and ends the process with error if they are not
 */
export function assertUserInput(
  questions: Question<keyof Answers>[],
  answers: Partial<Answers | Args>
) {
  for (const [key, value] of Object.entries(answers)) {
    if (value == null) {
      continue;
    }

    const question = questions.find((q) => q.name === key);

    if (question == null) {
      continue;
    }

    let validation;

    // We also need to guard against invalid choices
    // If we don't already have a validation message to provide a better error
    if ('choices' in question) {
      const choices =
        typeof question.choices === 'function'
          ? question.choices(undefined, answers)
          : question.choices;

      if (choices && choices.every((choice) => choice.value !== value)) {
        if (choices.length > 1) {
          validation = `Must be one of ${choices
            .map((choice) => kleur.green(choice.value))
            .join(', ')}`;
        } else if (choices[0]) {
          validation = `Must be '${kleur.green(choices[0].value)}'`;
        } else {
          validation = false;
        }
      }
    }

    if (validation == null && question.validate) {
      validation = question.validate(String(value));
    }

    if (validation != null && validation !== true) {
      let message = `Invalid value ${kleur.red(
        String(value)
      )} passed for ${kleur.blue(key)}`;

      if (typeof validation === 'string') {
        message += `: ${validation}`;
      }

      throw new Error(message);
    }
  }
}

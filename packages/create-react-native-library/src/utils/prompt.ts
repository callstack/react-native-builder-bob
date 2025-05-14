import kleur from 'kleur';
import prompts, {
  type Answers,
  type InitialReturnValue,
  type PromptType,
} from 'prompts';

type Choice = {
  title: string;
  value: string;
  description?: string;
};

export type Question<T extends string> = {
  name: T;
  type:
    | PromptType
    | null
    | ((
        prev: unknown,
        values: Partial<Record<T, unknown>>
      ) => PromptType | null);
  message: string;
  validate?: (value: string) => boolean | string;
  choices?:
    | Choice[]
    | ((prev: unknown, values: Partial<Record<T, unknown>>) => Choice[]);
  initial?:
    | InitialReturnValue
    | ((
        prev: unknown,
        values: Partial<Record<T, unknown>>
      ) => InitialReturnValue | Promise<InitialReturnValue>);
  default?: InitialReturnValue;
};

/**
 * Wrapper around `prompts` with additional features:
 *
 * - Improved type-safety
 * - Read answers from passed arguments
 * - Skip questions with a single choice
 * - Validate answers
 * - Exit on canceling the prompt
 * - Handle non-interactive mode
 */
export async function prompt<
  PromptAnswers extends Record<string, unknown>,
  Argv extends Record<string, unknown> | undefined,
>(
  questions:
    | Question<Extract<keyof PromptAnswers, string>>[]
    | Question<Extract<keyof PromptAnswers, string>>,
  argv: Argv,
  options: prompts.Options & {
    interactive: boolean | undefined;
  }
): Promise<PromptAnswers & Argv> {
  const interactive =
    options?.interactive ??
    (process.stdout.isTTY && process.env.TERM !== 'dumb' && !process.env.CI);

  const onCancel = () => {
    // Exit the CLI on Ctrl+C
    process.exit(1);
  };

  const onError = (message: string) => {
    console.log(message);
    process.exit(1);
  };

  if (argv) {
    validate(argv, questions, onError);
  }

  const defaultAnswers = {};
  const promptQuestions: Question<Extract<keyof PromptAnswers, string>>[] = [];

  if (Array.isArray(questions)) {
    for (const question of questions) {
      let promptQuestion = question;

      // Skip questions which are passed as parameter and pass validation
      const argValue = argv?.[question.name];

      if (argValue && question.validate?.(String(argValue)) !== false) {
        continue;
      }

      const { type, choices } = question;

      // Track default value from questions
      if (type && question.default != null) {
        // @ts-expect-error assume the passed value is correct
        defaultAnswers[question.name] = question.default;

        // Don't prompt questions with a default value when not interactive
        if (!interactive) {
          continue;
        }
      }

      // Don't prompt questions with a single choice
      if (
        type === 'select' &&
        Array.isArray(question.choices) &&
        question.choices.length === 1
      ) {
        const onlyChoice = question.choices[0];

        if (onlyChoice?.value) {
          // @ts-expect-error assume the passed value is correct
          defaultAnswers[question.name] = onlyChoice.value;
        }

        continue;
      }

      // Don't prompt dynamic questions with a single choice
      if (type === 'select' && typeof choices === 'function') {
        promptQuestion = {
          ...question,
          type: (prev, values) => {
            const dynamicChoices = choices(prev, { ...argv, ...values });

            if (dynamicChoices && dynamicChoices.length === 1) {
              const onlyChoice = dynamicChoices[0];

              if (onlyChoice?.value) {
                // @ts-expect-error assume the passed value is correct
                defaultAnswers[question.name] = onlyChoice.value;
              }

              return null;
            }

            return type;
          },
        };
      }

      promptQuestions.push(promptQuestion);
    }
  } else {
    promptQuestions.push(questions);
  }

  let promptAnswers;

  if (interactive) {
    promptAnswers = await prompts(promptQuestions, {
      ...options,
      onCancel,
    });
  } else {
    const missingQuestions = promptQuestions.reduce<string[]>(
      (acc, question) => {
        let type = question.type;

        if (typeof question.type === 'function') {
          // @ts-expect-error assume the passed value is correct
          type = question.type(null, argv, null);
        }

        if (type != null) {
          acc.push(
            question.name
              .replace(/([A-Z]+)/g, '-$1')
              .replace(/^-/, '')
              .toLowerCase()
          );
        }

        return acc;
      },
      []
    );

    if (missingQuestions.length) {
      onError(
        `Missing values for options: ${missingQuestions
          .map((q) => kleur.blue(q))
          .join(', ')}`
      );
    }
  }

  const result = {
    ...argv,
    ...defaultAnswers,
    ...promptAnswers,
  };

  validate(result, questions, onError);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  return result as PromptAnswers & Argv;
}

function validate<T extends string>(
  argv: Partial<Answers<T>>,
  questions: Question<T>[] | Question<T>,
  onError: (message: string) => void
) {
  for (const [key, value] of Object.entries(argv)) {
    if (value == null) {
      continue;
    }

    const question = Array.isArray(questions)
      ? questions.find((q) => q.name === key)
      : questions.name === key
        ? questions
        : null;

    if (question == null) {
      continue;
    }

    let validation;

    // We also need to guard against invalid choices
    // If we don't already have a validation message to provide a better error
    if ('choices' in question) {
      const choices =
        typeof question.choices === 'function'
          ? question.choices(undefined, argv)
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

      onError(message);
    }
  }
}

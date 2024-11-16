import { version } from '../package.json';
import type { Answers } from './input';

export function createMetadata(answers: Answers) {
  // Some of the passed args can already be derived from the generated package.json file.
  const ignoredAnswers: (keyof Answers)[] = [
    'name',
    'slug',
    'description',
    'authorName',
    'authorEmail',
    'authorUrl',
    'repoUrl',
    'example',
    'reactNativeVersion',
    'local',
  ];

  type AnswerEntries<T extends keyof Answers = keyof Answers> = [
    T,
    Answers[T],
  ][];

  const libraryMetadata = Object.fromEntries(
    (Object.entries(answers) as AnswerEntries).filter(
      ([answer]) => !ignoredAnswers.includes(answer)
    )
  );

  libraryMetadata.version = version;

  return libraryMetadata;
}

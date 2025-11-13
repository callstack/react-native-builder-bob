import { version } from '../../package.json';
import type { Answers } from '../prompt';

export function createMetadata(answers: Partial<Answers>) {
  // Some of the passed args can already be derived from the generated package.json file.
  const ignoredAnswers: (keyof Answers)[] = [
    'name',
    'directory',
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

  const libraryMetadata = Object.fromEntries(
    Object.entries(answers).filter(
      ([answer]) =>
        !ignoredAnswers.includes(
          // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
          answer as keyof Answers
        )
    )
  );

  libraryMetadata.version = version;

  return libraryMetadata;
}

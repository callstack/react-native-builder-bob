import run from '../jest/helpers';

it('shows up help information without passing in any args', () => {
  const { stderr } = run([]);
  expect(stderr.toString()).toContain(
    'Not enough non-option arguments: got 0, need at least 1'
  );
});

it('errors on supplying an unknown command', () => {
  const { stderr } = run(['unknown']);
  expect(stderr.toString()).toContain('Unknown argument: unknown');
});

it('suggests the closest match', () => {
  const { stderr } = run(['creaet']);
  expect(stderr.toString()).toContain('Did you mean create?');
});

import del from 'del';
import compile from '../utils/compile';
import { Input } from '../types';

type Options = Input & {
  options?: { flow?: boolean };
};

export default async function build({
  root,
  source,
  output,
  options,
  report
}: Options) {
  report.info('Cleaning up previous build');

  await del([output]);

  await compile({
    root,
    source,
    output,
    options: {
      presets: [[require.resolve('metro-react-native-babel-preset')]],
    },
    flow: options && options.flow ? true : false,
    report
  });
}

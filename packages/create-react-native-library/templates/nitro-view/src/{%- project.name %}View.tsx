import type { ViewProps } from 'react-native';

type Props = ViewProps & {
  color: string;
};

export function <%- project.name -%>View(_props: Props): never {
  throw new Error(
    "'<%- project.slug -%>' is only supported on native platforms."
  );
}

import type { ColorValue, ViewProps } from 'react-native';

type Props = ViewProps & {
  color?: ColorValue;
};

export function <%- project.name -%>View(_props: Props): never {
  throw new Error(
    "'<%- project.slug -%>' is only supported on native platforms."
  );
}

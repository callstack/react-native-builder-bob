<% if (project.viewConfig === 'nitro-view') { -%>
import { View, type ViewProps } from 'react-native';

type Props = ViewProps & {
  color: string;
};
<% } else { -%>
import { View, type ColorValue, type ViewProps } from 'react-native';

type Props = ViewProps & {
  color?: ColorValue;
};
<% } -%>

export function <%- project.name -%>View({ color, style, ...rest }: Props) {
  return <View {...rest} style={[style, { backgroundColor: color }]} />;
}

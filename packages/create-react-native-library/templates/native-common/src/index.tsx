<% if (project.moduleType === "view") { -%>
import { requireNativeComponent, ViewStyle } from 'react-native';

type <%- project.name %>Props = {
  color: string;
  style: ViewStyle;
};

export const <%- project.name %>ViewManager = requireNativeComponent<<%- project.name %>Props>(
'<%- project.name %>View'
);

export default <%- project.name %>ViewManager;
<% } else { -%>
import { NativeModules } from 'react-native';

type <%- project.name %>Type = {
  multiply(a: number, b: number): Promise<number>;
};

const { <%- project.name %> } = NativeModules;

export default <%- project.name %> as <%- project.name %>Type;
<% } -%>

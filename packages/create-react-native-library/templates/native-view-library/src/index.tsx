import { requireNativeComponent, ViewStyle } from 'react-native';

type <%- project.name %>Props = {
  color: string;
  style: ViewStyle;
};


export const <%- project.name %>ViewManager = requireNativeComponent<<%- project.name %>Props>(
  '<%- project.name %>View'
);

export default <%- project.name %>ViewManager;

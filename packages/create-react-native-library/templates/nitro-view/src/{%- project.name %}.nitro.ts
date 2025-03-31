import type {
  HybridView,
  HybridViewMethods,
  HybridViewProps,
} from 'react-native-nitro-modules';

export interface <%- project.name %>Props extends HybridViewProps {
  color: string;
}
export interface <%- project.name %>Methods extends HybridViewMethods {}

export type <%- project.name %> = HybridView<
  <%- project.name %>Props,
  <%- project.name %>Methods
>;
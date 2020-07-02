import { NativeModules, requireNativeComponent, ViewStyle } from 'react-native';

type <%= project.name %>Type = {
  multiply(a: number, b: number): Promise<number>;
};

type <%= project.name %>Props = {
  color: string;
  style: ViewStyle;
};

const { <%= project.name %> } = NativeModules;

export const <%= project.name %>ViewManager = requireNativeComponent<<%= project.name %>Props>(
  '<%= project.name %>View'
);

export default <%= project.name %> as <%= project.name %>Type;

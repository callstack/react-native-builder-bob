import { NativeModules } from 'react-native';

type <%= project.name %>Type = {
  multiply(a: number, b: number): Promise<number>;
};

const { <%= project.name %> } = NativeModules;

export default <%= project.name %> as <%= project.name %>Type;

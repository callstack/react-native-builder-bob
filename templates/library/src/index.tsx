import { NativeModules } from 'react-native';

type <%= project.name %>Type = {
  getDeviceName(): Promise<string>;
};

const { <%= project.name %> } = NativeModules;

export default <%= project.name %> as <%= project.name %>Type;

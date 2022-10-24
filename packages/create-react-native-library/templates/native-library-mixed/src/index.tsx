import { NativeModules, Platform } from 'react-native';

const LINKING_ERROR =
  `The package '<%- project.slug -%>' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

// @ts-expect-error
const isTurboModuleEnabled = global.__turboModuleProxy != null;

const <%- project.name -%>Module = isTurboModuleEnabled
  ? require('./Native<%- project.name -%>').default
  : NativeModules.<%- project.name -%>;

const <%- project.name -%> = <%- project.name -%>Module
  ? <%- project.name -%>Module
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

export function multiply(a: number, b: number): Promise<number> {
  return <%- project.name -%>.multiply(a, b);
}

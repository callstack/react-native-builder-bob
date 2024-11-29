import { NitroModules } from 'react-native-nitro-modules';
import { Platform } from 'react-native';
import type { <%- project.name -%> } from './<%- project.name -%>.nitro';

const LINKING_ERROR =
  `The package '<%- project.slug -%>' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

export const <%- project.name -%>HybridObject =
  NitroModules.createHybridObject<<%- project.name -%>>('<%- project.name -%>');

const <%- project.name -%> = <%- project.name -%>HybridObject
  ? <%- project.name -%>HybridObject
  : (new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    ) as <%- project.name -%>);

export function multiply(a: number, b: number): number {
  return <%- project.name -%>.multiply(a, b);
}

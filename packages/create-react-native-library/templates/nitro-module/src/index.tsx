import { NitroModules } from 'react-native-nitro-modules';
import type { <%- project.name -%> } from './<%- project.name -%>.nitro';

const <%- project.name -%>HybridObject =
  NitroModules.createHybridObject<<%- project.name -%>>('<%- project.name -%>');

export function multiply(a: number, b: number): number {
  return <%- project.name -%>HybridObject.multiply(a, b);
}

import <%- project.name -%> from './Native<%- project.name -%>';

export function multiply(a: number, b: number): number {
  return <%- project.name -%>.multiply(a, b);
}

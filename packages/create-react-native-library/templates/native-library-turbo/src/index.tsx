const <%- project.name -%> = require('./Native<%- project.name -%>').default;

export function multiply(a: number, b: number): number {
  return <%- project.name -%>.multiply(a, b);
}

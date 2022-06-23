const <%- project.name -%> = require('./Native<%- project.name -%>').default

export function multiply(a: number, b: number): Promise<number> {
  return <%- project.name -%>.multiply(a, b);
}

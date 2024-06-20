import { <%- project.name -%> } from './<%- project.name -%>';

export function multiply(a: number, b: number): Promise<number> {
  return <%- project.name -%>.multiply(a, b);
}

export * from './<%- project.name -%>View';

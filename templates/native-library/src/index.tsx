<% if (project.type !== 'js') { -%>
import { NativeModules } from 'react-native';
<% } -%>
type <%= project.name %>Type = {
  multiply(a: number, b: number): Promise<number>;
};

<% if (project.type === 'js') { -%>
const multiply = (a: number, b: number) => {
  return Promise.resolve(a * b);
}

export default {
  multiply
} as <%= project.name %>Type;
<% } else { -%>
const { <%= project.name %> } = NativeModules;

export default <%= project.name %> as <%= project.name %>Type;
<% } -%>

<% if (project.includeNative) { %>
import { NativeModules } from 'react-native';
<% } %>

type <%= project.name %>Type = {
  getDeviceName(): Promise<string>;
};

<% if (project.includeNative) { %>
const { <%= project.name %> } = NativeModules;
<% } else { %>
const <%= project.name %> = {
  getDeviceName: () => Promise.resolve('Phone')
};
<% } %>

export default <%= project.name %> as <%= project.name %>Type;

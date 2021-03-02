import * as React from 'react';
<% if (project.moduleType === "view") { %>
import { StyleSheet, View } from 'react-native';
import <%- project.name %>ViewManager from '<%- project.slug %>';
<% } else { %>
import { StyleSheet, View, Text } from 'react-native';
import <%- project.name %> from '<%- project.slug %>';
<% } %>
<% if (project.moduleType === "view") { %>
export default function App() {
  return (
    <View style={styles.container}>
      <<%- project.name %>ViewManager color="#32a852" style={styles.box} />
    </View>
  );
}
<% } else { %>
export default function App() {
  const [result, setResult] = React.useState<number | undefined>();

  React.useEffect(() => {
    <%- project.name %>.multiply(3, 7).then(setResult);
  }, []);

  return (
    <View style={styles.container}>
      <Text>Result: {result}</Text>
    </View>
  );
}
<% } %>
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});

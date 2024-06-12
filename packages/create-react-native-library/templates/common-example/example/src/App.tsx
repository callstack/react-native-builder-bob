import * as React from 'react';

<% if (project.view && project.module) { -%>
import { StyleSheet, View, Text } from 'react-native';
import { <%- project.name -%>View, multiply } from '<%- project.slug -%>';
<% } else if (project.view) { -%>
import { StyleSheet, View } from 'react-native';
import { <%- project.name -%>View } from '<%- project.slug -%>';
<% } else { -%>
import { StyleSheet, View, Text } from 'react-native';
import { multiply } from '<%- project.slug -%>';
<% } -%>

<% if (project.arch === 'new' && project.module) { -%>
const result = multiply(3, 7);

<% } -%>
export default function App() {
<% if ((project.arch !== 'new' && project.module) || !project.native) { -%>
  const [result, setResult] = React.useState<number | undefined>();

  React.useEffect(() => {
    multiply(3, 7).then(setResult);
  }, []);

<% } -%>
  return (
    <View style={styles.container}>
<% if (project.module || !project.native) { -%>
      <Text>Result: {result}</Text>
<% } -%>
<% if (project.view) { -%>
      <<%- project.name -%>View color="#32a852" style={styles.box} />
<% } -%>
    </View>
  );
}

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

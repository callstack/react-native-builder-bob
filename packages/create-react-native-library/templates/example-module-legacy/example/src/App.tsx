import { useState, useEffect } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { multiply } from '<%- project.slug -%>';

<% if (project.native) { -%>
export default function App() {
  const [result, setResult] = useState<number | undefined>();

  useEffect(() => {
    multiply(3, 7).then(setResult);
  }, []);

<% } else { -%>
const result = multiply(3, 7);

export default function App() {
<% } -%>
  return (
    <View style={styles.container}>
      <Text>Result: {result}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

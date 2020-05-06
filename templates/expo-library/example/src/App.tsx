import * as React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import <%= project.name %> from '<%= project.slug %>';

export default function App() {
  return (
    <View style={styles.container}>
      <Text>{<%= project.name %>}</Text>
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

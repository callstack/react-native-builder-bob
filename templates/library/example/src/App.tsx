import * as React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import <%= project.name %> from '<%= project.slug %>';

export default function App() {
  const [deviceName, setDeviceName] = React.useState('');
  <%if (project.useCpp==true) {%>
  const [value, setValue] = React.useState();
  <%}%>


  React.useEffect(() => {
    <%= project.name %>.getDeviceName().then(setDeviceName);
    <%if (project.useCpp==true) {%>
    <%= project.name %>.multiply(2, 3).then(setValue);
    <%}%>
  }, []);

  return (
    <View style={styles.container}>
      <Text>Device name: {deviceName}</Text>
      <%if (project.useCpp==true) {%>
      <Text>C++ mulitply value: {value}</Text>
      <%}%>
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

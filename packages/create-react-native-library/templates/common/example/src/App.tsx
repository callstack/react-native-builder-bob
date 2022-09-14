import * as React from 'react';

<% if (project.view) { -%>
import { StyleSheet, View } from 'react-native';
import { <%- project.name -%>View } from '<%- project.slug -%>';
<% if (project.architecture === "new") { -%>
import { Commands } from '<%- project.slug -%>';
import { Button } from 'react-native';
<% } -%>
<% } else { -%>
import { StyleSheet, View, Text } from 'react-native';
import { multiply } from '<%- project.slug -%>';
<% } -%>

<% if (project.view && project.architecture !=="new") { -%>
export default function App() {
  return (
    <View style={styles.container}>
      <<%- project.name -%>View color="#32a852" style={styles.box} />
    </View>
  );
}
<% } else if (project.view && project.architecture === 'new') { -%>
  function getRandomColor() {
    return [Math.random(), Math.random(), Math.random()].map((val) => Math.round(val*255).toString(16).padStart(2,'0')).join('').padStart(7,'#');
  }
  export default function App() {
    const ref = React.useRef(null);
    return (
      <View style={styles.container}>
        <<%- project.name -%>View ref={ref} color="#32a852" style={styles.box} />
        <Button title='Change color' onPress={() => 
          // @ts-ignore
          Commands.changeBackgroundColor(ref.current, getRandomColor())}/>
      </View>
    );
  }
<% } else if (project.module && project.architecture === 'new') { -%>
const result = multiply(3, 7);

export default function App() {
  return (
    <View style={styles.container}>
      <Text>Result: {result}</Text>
    </View>
  );
}
<% } else { -%>
export default function App() {
  const [result, setResult] = React.useState<number | undefined>();

  React.useEffect(() => {
    multiply(3, 7).then(setResult);
  }, []);

  return (
    <View style={styles.container}>
      <Text>Result: {result}</Text>
    </View>
  );
}
<% } -%>

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
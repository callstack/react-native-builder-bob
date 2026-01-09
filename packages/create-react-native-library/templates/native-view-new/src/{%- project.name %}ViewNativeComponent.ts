import {
  codegenNativeComponent,
  type ColorValue,
  type ViewProps,
} from 'react-native';

interface NativeProps extends ViewProps {
  color?: ColorValue;
}

export default codegenNativeComponent<NativeProps>('<%- project.name -%>View');

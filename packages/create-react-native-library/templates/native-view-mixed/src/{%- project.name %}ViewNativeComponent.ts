import codegenNativeComponent, { NativeComponentType } from 'react-native/Libraries/Utilities/codegenNativeComponent';
import codegenNativeCommands from 'react-native/Libraries/Utilities/codegenNativeCommands';
import type * as React from 'react';
import type {  ViewProps } from 'react-native';

interface NativeProps extends ViewProps  {
  color?: string,
};

export type <%- project.name -%>ViewType = NativeComponentType<NativeProps>;


interface NativeCommands {
  changeBackgroundColor: (
      viewRef: React.ElementRef<<%- project.name -%>ViewType>,
      color: string,
  ) => void;
}

export const Commands: NativeCommands = codegenNativeCommands<NativeCommands>({
  supportedCommands: ['changeBackgroundColor'],
});

export default codegenNativeComponent<NativeProps>('<%- project.name -%>View');
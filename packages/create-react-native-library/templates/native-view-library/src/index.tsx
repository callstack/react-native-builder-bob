import {
  requireNativeComponent,
  UIManager,
  Platform,
  ViewStyle,
} from 'react-native';

const LINKING_ERROR =
  `The package '<%- project.slug %>' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo managed workflow\n';

type <%- project.name %>Props = {
  color: string;
  style: ViewStyle;
};

const ComponentName = '<%- project.name %>View';

export const <%- project.name %>View =
  UIManager.getViewManagerConfig(ComponentName) != null
    ? requireNativeComponent<<%- project.name %>Props>(ComponentName)
    : () => {
        throw new Error(LINKING_ERROR);
      };

import { getHostComponent } from 'react-native-nitro-modules';
import <%- project.name %>Config from '../nitrogen/generated/shared/json/<%- project.name %>Config.json';
import type {
  <%- project.name %>Methods,
  <%- project.name %>Props,
} from './<%- project.name %>.nitro';

export const <%- project.name %>View = getHostComponent<
  <%- project.name %>Props,
  <%- project.name %>Methods
>('<%- project.name %>', () => <%- project.name %>Config);

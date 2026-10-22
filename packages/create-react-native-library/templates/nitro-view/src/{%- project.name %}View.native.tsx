import { getHostComponent } from 'react-native-nitro-modules';
import type {
  <%- project.name %>Methods,
  <%- project.name %>Props,
} from './<%- project.name %>.nitro';

const <%- project.name %>Config = require('<%- project.slug %>/nitrogen/generated/shared/json/<%- project.name %>Config.json');

export const <%- project.name %>View = getHostComponent<
  <%- project.name %>Props,
  <%- project.name %>Methods
>('<%- project.name %>', () => <%- project.name %>Config);

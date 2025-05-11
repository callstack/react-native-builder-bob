import { useMDXComponents as getThemeComponents } from 'nextra-theme-docs';

const themeComponents = getThemeComponents();

export function useMDXComponents(components: typeof themeComponents) {
  return { ...themeComponents, ...components };
}

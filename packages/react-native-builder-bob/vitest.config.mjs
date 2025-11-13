import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    exclude: ['**/lib/**', '**/node_modules/**'],
  },
});

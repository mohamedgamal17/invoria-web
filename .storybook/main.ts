import { createStorybookConfig } from './storybook-config';

export default createStorybookConfig([
  './gallery/**/*.mdx',
  '../modules/**/src/**/*.stories.@(js|jsx|mjs|ts|tsx)',
]);

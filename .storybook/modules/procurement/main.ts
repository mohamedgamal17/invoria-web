import { createStorybookConfig } from '../../storybook-config';

export default createStorybookConfig([
  './gallery/**/*.mdx',
  '../../../modules/procurement/src/**/*.stories.@(js|jsx|mjs|ts|tsx)',
]);

import { createStorybookConfig } from '../../storybook-config';

export default createStorybookConfig([
  './gallery/**/*.mdx',
  '../../../modules/inventory/src/**/*.stories.@(js|jsx|mjs|ts|tsx)',
]);

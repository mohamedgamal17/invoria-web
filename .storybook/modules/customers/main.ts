import { createStorybookConfig } from '../../storybook-config';

export default createStorybookConfig([
  './gallery/**/*.mdx',
  '../../../modules/customers/src/**/*.stories.@(js|jsx|mjs|ts|tsx)',
]);

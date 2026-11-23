import { createStorybookConfig } from '../../storybook-config';

export default createStorybookConfig([
  './gallery/**/*.mdx',
  '../../../modules/financial/src/**/*.stories.@(js|jsx|mjs|ts|tsx)',
]);

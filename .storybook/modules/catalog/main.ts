import { createStorybookConfig } from '../../storybook-config';

export default createStorybookConfig([
  './gallery/**/*.mdx',
  '../../../modules/catalog/src/**/*.stories.@(js|jsx|mjs|ts|tsx)',
]);

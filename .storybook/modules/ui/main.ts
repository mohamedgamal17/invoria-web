import { createStorybookConfig } from '../../storybook-config';

export default createStorybookConfig([
  './gallery/**/*.mdx',
  '../../../modules/ui/src/**/*.stories.@(js|jsx|mjs|ts|tsx)',
]);

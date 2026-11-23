import type { StorybookConfig } from '@storybook/angular';

/**
 * Shared Storybook configuration used by the global instance and every
 * per-module instance. Modules are configured to show only their own stories,
 * so each team gets a focused Storybook on its own port without importing
 * sibling modules' components.
 */
export function createStorybookConfig(stories: string[]): StorybookConfig {
  return {
    stories,
    addons: ['@storybook/addon-a11y', '@storybook/addon-docs'],
    framework: {
      name: '@storybook/angular',
      options: {},
    },
    core: {
      disableTelemetry: true,
    },
  };
}

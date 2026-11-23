import type { Meta, StoryObj } from '@storybook/angular';
import { ErrorCardComponent } from './error-card.component';

const meta: Meta<ErrorCardComponent> = {
  title: 'UI/ErrorCard',
  component: ErrorCardComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<ErrorCardComponent>;

export const Default: Story = {
  args: {
    title: 'Failed to load details',
    message: 'An unexpected error occurred while communicating with the server. Please try again.',
    retryLabel: 'Retry',
  },
};

export const CustomRetryLabel: Story = {
  args: {
    title: 'Network Timeout',
    message: 'The connection timed out while fetching customer balances.',
    retryLabel: 'Reconnect',
  },
};

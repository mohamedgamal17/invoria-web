import type { Meta, StoryObj } from '@storybook/angular';
import { EmptyStateComponent } from './empty-state.component';

const meta: Meta<EmptyStateComponent> = {
  title: 'UI/EmptyState',
  component: EmptyStateComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<EmptyStateComponent>;

export const Default: Story = {
  args: {
    title: 'No products found',
    description: 'Try adjusting your search or filter to find what you are looking for.',
  },
};

export const CustomIcon: Story = {
  args: {
    icon: 'pi pi-search',
    title: 'No results',
    description: 'Your search did not match any records.',
  },
};

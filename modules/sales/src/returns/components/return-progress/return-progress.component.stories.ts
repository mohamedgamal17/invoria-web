import type { Meta, StoryObj } from '@storybook/angular';
import { ReturnProgressComponent } from './return-progress.component';
import { ReturnStatus } from '../../models/return-status.enum';

const meta: Meta<ReturnProgressComponent> = {
  title: 'Sales/Returns/ReturnProgress',
  component: ReturnProgressComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<ReturnProgressComponent>;

export const Pending: Story = {
  args: {
    status: ReturnStatus.Pending,
    showLabel: true,
  },
};

export const Approved: Story = {
  args: {
    status: ReturnStatus.Approved,
    showLabel: true,
  },
};

export const Completed: Story = {
  args: {
    status: ReturnStatus.Completed,
    showLabel: true,
  },
};

export const Rejected: Story = {
  args: {
    status: ReturnStatus.Rejected,
    showLabel: true,
  },
};

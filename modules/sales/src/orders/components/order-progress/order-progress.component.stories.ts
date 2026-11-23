import type { Meta, StoryObj } from '@storybook/angular';
import { OrderProgressComponent } from './order-progress.component';
import { OrderStatus } from '../../models/order.entity';

const meta: Meta<OrderProgressComponent> = {
  title: 'Sales/Orders/OrderProgress',
  component: OrderProgressComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<OrderProgressComponent>;

export const PendingOrder: Story = {
  args: {
    status: OrderStatus.Pending,
    orderAllocated: false,
    showLabel: true,
  },
};

export const ProcessingAllocating: Story = {
  args: {
    status: OrderStatus.Processing,
    orderAllocated: false,
    showLabel: true,
  },
};

export const ProcessingAllocated: Story = {
  args: {
    status: OrderStatus.Processing,
    orderAllocated: true,
    showLabel: true,
  },
};

export const CompletedOrder: Story = {
  args: {
    status: OrderStatus.Completed,
    orderAllocated: true,
    showLabel: true,
  },
};

export const CancelledOrder: Story = {
  args: {
    status: OrderStatus.Cancelled,
    orderAllocated: false,
    showLabel: true,
  },
};

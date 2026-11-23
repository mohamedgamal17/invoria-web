import type { Meta, StoryObj } from '@storybook/angular';
import { OrderHeaderComponent } from './order-header.component';

const meta: Meta<OrderHeaderComponent> = {
  title: 'Sales/Orders/OrderHeader',
  component: OrderHeaderComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<OrderHeaderComponent>;

export const Default: Story = {
  args: {
    title: 'Orders',
    description: 'Manage and track customer orders from creation to fulfillment.',
  },
};

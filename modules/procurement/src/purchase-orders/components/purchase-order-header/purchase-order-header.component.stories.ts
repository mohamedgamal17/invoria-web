import type { Meta, StoryObj } from '@storybook/angular';
import { PurchaseOrderHeaderComponent } from './purchase-order-header.component';

const meta: Meta<PurchaseOrderHeaderComponent> = {
  title: 'Procurement/PurchaseOrders/PurchaseOrderHeader',
  component: PurchaseOrderHeaderComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<PurchaseOrderHeaderComponent>;

export const Default: Story = {
  args: {
    title: 'Purchase orders',
    description: 'Review supplier purchase orders, amounts, and workflow state.',
    showCreate: true,
  },
};

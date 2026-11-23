import type { Meta, StoryObj } from '@storybook/angular';
import { PurchaseOrdersFilterPanelComponent } from './purchase-orders-filter-panel.component';

const meta: Meta<PurchaseOrdersFilterPanelComponent> = {
  title: 'Procurement/PurchaseOrders/PurchaseOrdersFilterPanel',
  component: PurchaseOrdersFilterPanelComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<PurchaseOrdersFilterPanelComponent>;

export const Default: Story = {
  args: {
    purchaseNumber: '',
    status: null,
    loading: false,
  },
};

export const Filtered: Story = {
  args: {
    purchaseNumber: 'PO-2026',
    status: 1,
    loading: false,
  },
};

export const Loading: Story = {
  args: {
    purchaseNumber: '',
    status: null,
    loading: true,
  },
};

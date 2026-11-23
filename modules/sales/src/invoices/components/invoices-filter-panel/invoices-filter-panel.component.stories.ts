import type { Meta, StoryObj } from '@storybook/angular';
import { InvoicesFilterPanelComponent } from './invoices-filter-panel.component';

const meta: Meta<InvoicesFilterPanelComponent> = {
  title: 'Sales/Invoices/InvoicesFilterPanel',
  component: InvoicesFilterPanelComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<InvoicesFilterPanelComponent>;

export const DefaultEmpty: Story = {
  args: {
    customerId: '',
    orderId: '',
    loading: false,
  },
};

export const WithFilters: Story = {
  args: {
    customerId: 'cust_101',
    orderId: 'ORD-2026-0042',
    loading: false,
  },
};

export const LoadingState: Story = {
  args: {
    customerId: '',
    orderId: '',
    loading: true,
  },
};

import type { Meta, StoryObj } from '@storybook/angular';
import { PayablesFilterPanelComponent } from './payables-filter-panel.component';

const sampleSuppliers = [
  { id: 'sup_1', name: 'El-Sewedy Electrical' },
  { id: 'sup_2', name: 'Alexandria Paper Co' },
  { id: 'sup_3', name: 'Nile Chemical Industries' },
];

const meta: Meta<PayablesFilterPanelComponent> = {
  title: 'Financial/Payables/PayablesFilterPanel',
  component: PayablesFilterPanelComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<PayablesFilterPanelComponent>;

export const DefaultEmpty: Story = {
  args: {
    suppliers: sampleSuppliers,
    supplierId: '',
    sourceId: '',
    isPaid: null,
    loading: false,
  },
};

export const Filtered: Story = {
  args: {
    suppliers: sampleSuppliers,
    supplierId: 'sup_1',
    sourceId: 'PO-2026',
    isPaid: false,
    loading: false,
  },
};

export const LoadingState: Story = {
  args: {
    suppliers: sampleSuppliers,
    supplierId: '',
    sourceId: '',
    isPaid: null,
    loading: true,
  },
};

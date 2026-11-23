import type { Meta, StoryObj } from '@storybook/angular';
import { SupplierHeaderComponent } from './supplier-header.component';

const meta: Meta<SupplierHeaderComponent> = {
  title: 'Procurement/Suppliers/SupplierHeader',
  component: SupplierHeaderComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<SupplierHeaderComponent>;

export const Default: Story = {
  args: {
    title: 'Suppliers',
    description: 'Manage procurement suppliers, codes, and contact details.',
    eyebrow: 'Procurement',
  },
};

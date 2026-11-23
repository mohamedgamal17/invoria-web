import type { Meta, StoryObj } from '@storybook/angular';
import { SupplierDetailsProfileComponent } from './supplier-details-profile.component';
import type { Supplier } from '../../models/supplier.entity';

const sampleSupplier: Supplier = {
  id: 'sup_01',
  name: 'El-Sewedy Electrical Solutions',
  contactEmail: 'contact@elsewedy.com',
  phone: '+20 2 2759 9700',
  createdAt: '2026-01-15T08:00:00Z',
  createdBy: 'admin',
  lastModifiedAt: '2026-06-20T12:00:00Z',
  lastModifiedBy: 'admin',
};

const meta: Meta<SupplierDetailsProfileComponent> = {
  title: 'Procurement/Suppliers/SupplierDetailsProfile',
  component: SupplierDetailsProfileComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<SupplierDetailsProfileComponent>;

export const Default: Story = {
  args: {
    supplier: sampleSupplier,
  },
};

export const MinimalInfo: Story = {
  args: {
    supplier: {
      id: 'sup_02',
      name: 'Nile Chemical Industries',
      createdAt: '2026-03-01T08:00:00Z',
      createdBy: 'admin',
      lastModifiedAt: '2026-03-01T08:00:00Z',
      lastModifiedBy: 'admin',
    },
  },
};

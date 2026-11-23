import type { Meta, StoryObj } from '@storybook/angular';
import { SupplierListComponent } from './supplier-list.component';
import type { Supplier } from '../../models/supplier.entity';

const sampleSuppliers: Supplier[] = [
  {
    id: 'sup_1',
    name: 'El-Sewedy Electrical Solutions',
    contactEmail: 'sales@elsewedy.com',
    phone: '+20 2 27599700',
    createdAt: '2026-01-10T08:00:00Z',
    createdBy: 'system',
    lastModifiedAt: '2026-10-01T10:00:00Z',
    lastModifiedBy: 'system',
  },
  {
    id: 'sup_2',
    name: 'Alexandria Paper & Packaging Co',
    contactEmail: 'contact@alexpaper.eg',
    phone: '+20 3 4291100',
    createdAt: '2026-02-15T09:30:00Z',
    createdBy: 'system',
    lastModifiedAt: '2026-11-05T12:00:00Z',
    lastModifiedBy: 'system',
  },
  {
    id: 'sup_3',
    name: 'Nile Chemical Industries',
    contactEmail: 'info@nilechem.com',
    phone: '+20 2 33458900',
    createdAt: '2026-03-01T11:00:00Z',
    createdBy: 'system',
    lastModifiedAt: '2026-11-12T16:20:00Z',
    lastModifiedBy: 'system',
  },
];

const meta: Meta<SupplierListComponent> = {
  title: 'Procurement/Suppliers/SupplierList',
  component: SupplierListComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<SupplierListComponent>;

export const WithSuppliers: Story = {
  args: {
    suppliers: sampleSuppliers,
    totalRecords: 3,
    first: 0,
    pageSize: 10,
    isListLoading: false,
  },
};

export const LoadingState: Story = {
  args: {
    suppliers: [],
    totalRecords: 0,
    first: 0,
    pageSize: 5,
    isListLoading: true,
  },
};

export const EmptyState: Story = {
  args: {
    suppliers: [],
    totalRecords: 0,
    first: 0,
    pageSize: 10,
    isListLoading: false,
  },
};

import type { Meta, StoryObj } from '@storybook/angular';
import { CustomerListComponent } from './customer-list.component';
import type { Customer } from '../../models/customer.entity';

const sampleCustomers: Customer[] = [
  {
    id: 'cust_1',
    name: 'Cairo Modern Retail Co.',
    createdAt: '2026-01-15T09:00:00Z',
    createdBy: 'system',
    lastModifiedAt: '2026-10-01T11:00:00Z',
    lastModifiedBy: 'system',
  },
  {
    id: 'cust_2',
    name: 'Alexandria Hypermarket S.A.E',
    createdAt: '2026-03-20T14:00:00Z',
    createdBy: 'system',
    lastModifiedAt: '2026-11-12T16:00:00Z',
    lastModifiedBy: 'system',
  },
  {
    id: 'cust_3',
    name: 'Giza Wholesale Distributors',
    createdAt: '2026-04-10T08:30:00Z',
    createdBy: 'system',
    lastModifiedAt: '2026-11-18T12:00:00Z',
    lastModifiedBy: 'system',
  },
];

const meta: Meta<CustomerListComponent> = {
  title: 'Customers/CustomerList',
  component: CustomerListComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<CustomerListComponent>;

export const WithCustomers: Story = {
  args: {
    customers: sampleCustomers,
    totalRecords: 3,
    first: 0,
    pageSize: 10,
    isListLoading: false,
  },
};

export const LoadingState: Story = {
  args: {
    customers: [],
    totalRecords: 0,
    first: 0,
    pageSize: 5,
    isListLoading: true,
  },
};

export const EmptyState: Story = {
  args: {
    customers: [],
    totalRecords: 0,
    first: 0,
    pageSize: 10,
    isListLoading: false,
  },
};

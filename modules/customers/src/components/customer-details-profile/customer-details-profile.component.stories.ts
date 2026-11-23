import type { Meta, StoryObj } from '@storybook/angular';
import { CustomerDetailsProfileComponent } from './customer-details-profile.component';
import type { Customer } from '../../models/customer.entity';

const sampleCustomer: Customer = {
  id: 'cust_101',
  name: 'Acme Global Logistics',
  createdAt: '2026-02-14T10:00:00Z',
  createdBy: 'admin',
  lastModifiedAt: '2026-11-05T14:30:00Z',
  lastModifiedBy: 'admin',
};

const meta: Meta<CustomerDetailsProfileComponent> = {
  title: 'Customers/CustomerDetailsProfile',
  component: CustomerDetailsProfileComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<CustomerDetailsProfileComponent>;

export const Default: Story = {
  args: {
    customer: sampleCustomer,
  },
};

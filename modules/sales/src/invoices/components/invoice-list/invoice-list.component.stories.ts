import type { Meta, StoryObj } from '@storybook/angular';
import { InvoiceListComponent } from './invoice-list.component';
import type { Invoice } from '../../models/invoice.entity';

const sampleInvoices: Invoice[] = [
  {
    id: 'inv_1',
    invoiceNumber: 'INV-2026-0001',
    customerId: 'cust_1',
    orderId: 'ord_1',
    subtotal: 18500,
    totalPrice: 21090,
    items: [],
    createdAt: '2026-11-10T09:00:00Z',
    createdBy: 'system',
    lastModifiedAt: '2026-11-10T09:00:00Z',
    lastModifiedBy: 'system',
  },
  {
    id: 'inv_2',
    invoiceNumber: 'INV-2026-0002',
    customerId: 'cust_2',
    orderId: 'ord_2',
    subtotal: 32000,
    totalPrice: 36480,
    items: [],
    createdAt: '2026-11-18T14:30:00Z',
    createdBy: 'system',
    lastModifiedAt: '2026-11-18T14:30:00Z',
    lastModifiedBy: 'system',
  },
];

const meta: Meta<InvoiceListComponent> = {
  title: 'Sales/Invoices/InvoiceList',
  component: InvoiceListComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<InvoiceListComponent>;

export const WithInvoices: Story = {
  args: {
    invoices: sampleInvoices,
    totalRecords: 2,
    first: 0,
    pageSize: 10,
    isListLoading: false,
  },
};

export const LoadingState: Story = {
  args: {
    invoices: [],
    totalRecords: 0,
    first: 0,
    pageSize: 5,
    isListLoading: true,
  },
};

export const EmptyState: Story = {
  args: {
    invoices: [],
    totalRecords: 0,
    first: 0,
    pageSize: 10,
    isListLoading: false,
  },
};

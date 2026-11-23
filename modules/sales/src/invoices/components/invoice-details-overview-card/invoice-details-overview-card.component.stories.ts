import type { Meta, StoryObj } from '@storybook/angular';
import { applicationConfig } from '@storybook/angular';
import { provideRouter } from '@angular/router';
import { InvoiceDetailsOverviewCardComponent } from './invoice-details-overview-card.component';
import type { Invoice } from '../../models/invoice.entity';

const sampleInvoice: Invoice = {
  id: 'inv_001',
  invoiceNumber: 'INV-2026-0001',
  customerId: 'cust_001',
  orderId: 'ord_1001',
  subtotal: 2550,
  totalPrice: 2550,
  items: [
    {
      orderItemId: 'item_01',
      productId: 'prd_01',
      quantity: 3,
      price: 450,
      lineTotal: 1350,
    },
    {
      orderItemId: 'item_02',
      productId: 'prd_02',
      quantity: 1,
      price: 1200,
      lineTotal: 1200,
    },
  ],
  createdAt: '2026-11-10T14:30:00Z',
  createdBy: 'billing_service',
  lastModifiedAt: '2026-11-10T14:30:00Z',
  lastModifiedBy: 'billing_service',
};

const meta: Meta<InvoiceDetailsOverviewCardComponent> = {
  title: 'Sales/Invoices/InvoiceDetailsOverviewCard',
  component: InvoiceDetailsOverviewCardComponent,
  tags: ['autodocs'],
  decorators: [
    applicationConfig({
      providers: [provideRouter([])],
    }),
  ],
};

export default meta;
type Story = StoryObj<InvoiceDetailsOverviewCardComponent>;

export const Default: Story = {
  args: {
    invoice: sampleInvoice,
    currencyCode: 'EGP',
  },
};

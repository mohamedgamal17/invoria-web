import type { Meta, StoryObj } from '@storybook/angular';
import { applicationConfig } from '@storybook/angular';
import { provideRouter } from '@angular/router';
import { InvoiceDetailsItemsTabComponent } from './invoice-details-items-tab.component';
import type { InvoiceItem } from '../../models/invoice.entity';

const sampleItems: InvoiceItem[] = [
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
];

const meta: Meta<InvoiceDetailsItemsTabComponent> = {
  title: 'Sales/Invoices/InvoiceDetailsItemsTab',
  component: InvoiceDetailsItemsTabComponent,
  tags: ['autodocs'],
  decorators: [
    applicationConfig({
      providers: [provideRouter([])],
    }),
  ],
};

export default meta;
type Story = StoryObj<InvoiceDetailsItemsTabComponent>;

export const Default: Story = {
  args: {
    items: sampleItems,
    currencyCode: 'EGP',
  },
};

export const Empty: Story = {
  args: {
    items: [],
    currencyCode: 'EGP',
  },
};

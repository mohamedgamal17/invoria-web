import type { Meta, StoryObj } from '@storybook/angular';
import { InvoiceHeaderComponent } from './invoice-header.component';

const meta: Meta<InvoiceHeaderComponent> = {
  title: 'Sales/Invoices/InvoiceHeader',
  component: InvoiceHeaderComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<InvoiceHeaderComponent>;

export const Default: Story = {};

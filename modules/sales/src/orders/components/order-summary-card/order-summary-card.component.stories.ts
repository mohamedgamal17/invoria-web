import type { Meta, StoryObj } from '@storybook/angular';
import { applicationConfig } from '@storybook/angular';
import { provideRouter } from '@angular/router';
import { OrderSummaryCardComponent } from './order-summary-card.component';
import { OrderStatus } from '../../models/order.entity';
import { PaymentStatus, PaymentType } from '../../models/order-payment.enums';
import type { UiOrder } from '../../models/order-ui.model';

const sampleOrder: UiOrder = {
  id: 'ord_555',
  orderNumber: 'ORD-2026-0555',
  customerName: 'Cairo Medical Supplies',
  customerId: 'cust_1',
  netOfTotalOrderAmount: 42000,
  returnsTotal: 0,
  amountDue: 21000,
  amountPaid: 21000,
  amountOutstanding: 21000,
  status: OrderStatus.Processing,
  paymentStatus: PaymentStatus.Partial,
  paymentType: PaymentType.Debt,
  orderDate: '2026-11-18T10:00:00Z',
  items: [],
  returnItems: [],
  orderAllocated: true,
  createdAt: '2026-11-18T10:00:00Z',
};

const meta: Meta<OrderSummaryCardComponent> = {
  title: 'Sales/Orders/OrderSummaryCard',
  component: OrderSummaryCardComponent,
  tags: ['autodocs'],
  decorators: [
    applicationConfig({
      providers: [provideRouter([])],
    }),
  ],
};

export default meta;
type Story = StoryObj<OrderSummaryCardComponent>;

export const Default: Story = {
  args: {
    order: sampleOrder,
    currencyCode: 'EGP',
  },
};

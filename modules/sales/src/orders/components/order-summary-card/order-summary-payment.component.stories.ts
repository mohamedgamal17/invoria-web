import type { Meta, StoryObj } from '@storybook/angular';
import { OrderSummaryPaymentComponent } from './order-summary-payment.component';
import { OrderStatus } from '../../models/order.entity';
import { PaymentStatus, PaymentType } from '../../models/order-payment.enums';
import type { UiOrder } from '../../models/order-ui.model';

const sampleOrder: UiOrder = {
  id: 'ord_101',
  orderNumber: 'ORD-2026-0101',
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

const meta: Meta<OrderSummaryPaymentComponent> = {
  title: 'Sales/Orders/OrderSummaryPayment',
  component: OrderSummaryPaymentComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<OrderSummaryPaymentComponent>;

export const PartialPayment: Story = {
  args: {
    order: sampleOrder,
    currencyCode: 'EGP',
  },
};

export const FullyPaid: Story = {
  args: {
    order: {
      ...sampleOrder,
      paymentStatus: PaymentStatus.Paid,
      amountPaid: 42000,
      amountOutstanding: 0,
    },
    currencyCode: 'EGP',
  },
};

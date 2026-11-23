import type { Meta, StoryObj } from '@storybook/angular';
import { OrderDetailsPaymentTabComponent } from './order-details-payment-tab.component';
import { OrderStatus } from '../../models/order.entity';
import { PaymentStatus, PaymentType, OrderPaymentMethod } from '../../models/order-payment.enums';
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
  payments: [
    {
      id: 'pay_1',
      orderId: 'ord_101',
      paidAmount: 21000,
      paymentMethod: OrderPaymentMethod.BankTransfer,
      paidAt: '2026-11-18T11:00:00Z',
      createdAt: '2026-11-18T11:00:00Z',
      createdBy: 'finance',
      lastModifiedAt: '2026-11-18T11:00:00Z',
      lastModifiedBy: 'finance',
    },
  ],
  createdAt: '2026-11-18T10:00:00Z',
};

const meta: Meta<OrderDetailsPaymentTabComponent> = {
  title: 'Sales/Orders/OrderDetailsPaymentTab',
  component: OrderDetailsPaymentTabComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<OrderDetailsPaymentTabComponent>;

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

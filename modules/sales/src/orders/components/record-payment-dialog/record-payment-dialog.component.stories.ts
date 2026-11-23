import type { Meta, StoryObj } from '@storybook/angular';
import { RecordPaymentDialogComponent } from './record-payment-dialog.component';
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

const meta: Meta<RecordPaymentDialogComponent> = {
  title: 'Sales/Orders/RecordPaymentDialog',
  component: RecordPaymentDialogComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<RecordPaymentDialogComponent>;

export const Open: Story = {
  args: {
    visible: true,
    order: sampleOrder,
    saving: false,
  },
};

export const Saving: Story = {
  args: {
    visible: true,
    order: sampleOrder,
    saving: true,
  },
};

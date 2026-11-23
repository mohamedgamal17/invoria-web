import type { Meta, StoryObj } from '@storybook/angular';
import { OrderSummaryReferencesComponent } from './order-summary-references.component';
import { OrderStatus } from '../../models/order.entity';
import { PaymentStatus, PaymentType } from '../../models/order-payment.enums';
import type { UiOrder } from '../../models/order-ui.model';

const sampleOrder: UiOrder = {
  id: 'ord_101',
  orderNumber: 'ORD-2026-0101',
  customerName: 'Cairo Medical Supplies',
  customerId: 'cust_1',
  netOfTotalOrderAmount: 2450,
  returnsTotal: 0,
  status: OrderStatus.Completed,
  paymentStatus: PaymentStatus.Paid,
  paymentType: PaymentType.Immediate,
  orderDate: '2026-11-18T10:00:00Z',
  items: [],
  returnItems: [],
  orderAllocated: true,
  allocationId: 'alloc_001',
  invoiceId: 'inv_001',
  returnId: 'ret_001',
  createdAt: '2026-11-18T10:00:00Z',
};

const meta: Meta<OrderSummaryReferencesComponent> = {
  title: 'Sales/Orders/OrderSummaryReferences',
  component: OrderSummaryReferencesComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<OrderSummaryReferencesComponent>;

export const Default: Story = {
  args: {
    order: sampleOrder,
  },
};

export const WithoutReferences: Story = {
  args: {
    order: {
      ...sampleOrder,
      allocationId: undefined,
      invoiceId: undefined,
      returnId: undefined,
    },
  },
};

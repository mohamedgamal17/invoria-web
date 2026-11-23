import type { Meta, StoryObj } from '@storybook/angular';
import { OrderListComponent } from './order-list.component';
import { OrderStatus } from '../../models/order.entity';
import { PaymentStatus, PaymentType } from '../../models/order-payment.enums';
import type { UiOrder } from '../../models/order-ui.model';

const sampleOrders: UiOrder[] = [
  {
    id: 'ord_1',
    orderNumber: 'ORD-2026-0001',
    customerName: 'Cairo Medical Supplies',
    customerId: 'cust_1',
    netOfTotalOrderAmount: 18500,
    returnsTotal: 0,
    amountDue: 0,
    amountPaid: 18500,
    amountOutstanding: 0,
    status: OrderStatus.Completed,
    paymentStatus: PaymentStatus.Paid,
    paymentType: PaymentType.Immediate,
    orderDate: '2026-11-10T09:00:00Z',
    items: [],
    returnItems: [],
    orderAllocated: true,
    createdAt: '2026-11-10T09:00:00Z',
  },
  {
    id: 'ord_2',
    orderNumber: 'ORD-2026-0002',
    customerName: 'Alexandria Pharma Group',
    customerId: 'cust_2',
    netOfTotalOrderAmount: 32000,
    returnsTotal: 0,
    amountDue: 16000,
    amountPaid: 16000,
    amountOutstanding: 16000,
    status: OrderStatus.Processing,
    paymentStatus: PaymentStatus.Partial,
    paymentType: PaymentType.Debt,
    orderDate: '2026-11-18T14:30:00Z',
    items: [],
    returnItems: [],
    orderAllocated: false,
    createdAt: '2026-11-18T14:30:00Z',
  },
  {
    id: 'ord_3',
    orderNumber: 'ORD-2026-0003',
    customerName: 'Delta Labs',
    customerId: 'cust_3',
    netOfTotalOrderAmount: 8400,
    returnsTotal: 0,
    amountDue: 8400,
    amountPaid: 0,
    amountOutstanding: 8400,
    status: OrderStatus.Pending,
    paymentStatus: PaymentStatus.Unpaid,
    paymentType: PaymentType.Debt,
    orderDate: '2026-11-21T11:15:00Z',
    items: [],
    returnItems: [],
    orderAllocated: false,
    createdAt: '2026-11-21T11:15:00Z',
  },
];

const meta: Meta<OrderListComponent> = {
  title: 'Sales/Orders/OrderList',
  component: OrderListComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<OrderListComponent>;

export const WithOrders: Story = {
  args: {
    orders: sampleOrders,
    totalRecords: 3,
    first: 0,
    pageSize: 10,
    loading: false,
    showDelete: false,
  },
};

export const LoadingState: Story = {
  args: {
    orders: [],
    totalRecords: 0,
    first: 0,
    pageSize: 5,
    loading: true,
    showDelete: false,
  },
};

export const EmptyState: Story = {
  args: {
    orders: [],
    totalRecords: 0,
    first: 0,
    pageSize: 10,
    loading: false,
    showDelete: false,
  },
};

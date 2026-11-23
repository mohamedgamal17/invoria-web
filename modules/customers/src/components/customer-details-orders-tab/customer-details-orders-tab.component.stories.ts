import type { Meta, StoryObj } from '@storybook/angular';
import { CustomerDetailsOrdersTabComponent } from './customer-details-orders-tab.component';
import { OrderStatus } from '@invoria/sales';
import { PaymentStatus, PaymentType } from '@invoria/sales';
import type { UiOrder } from '@invoria/sales';

const sampleOrders: UiOrder[] = [
  {
    id: 'ord_1',
    orderNumber: 'ORD-2026-0042',
    customerName: 'Acme Global Logistics',
    customerId: 'cust_101',
    netOfTotalOrderAmount: 24500,
    returnsTotal: 0,
    amountDue: 0,
    amountPaid: 24500,
    amountOutstanding: 0,
    status: OrderStatus.Completed,
    paymentStatus: PaymentStatus.Paid,
    paymentType: PaymentType.Immediate,
    orderDate: '2026-11-01T10:00:00Z',
    items: [],
    returnItems: [],
    orderAllocated: true,
    createdAt: '2026-11-01T10:00:00Z',
  },
  {
    id: 'ord_2',
    orderNumber: 'ORD-2026-0089',
    customerName: 'Acme Global Logistics',
    customerId: 'cust_101',
    netOfTotalOrderAmount: 18000,
    returnsTotal: 0,
    amountDue: 9000,
    amountPaid: 9000,
    amountOutstanding: 9000,
    status: OrderStatus.Processing,
    paymentStatus: PaymentStatus.Partial,
    paymentType: PaymentType.Debt,
    orderDate: '2026-11-15T14:30:00Z',
    items: [],
    returnItems: [],
    orderAllocated: true,
    createdAt: '2026-11-15T14:30:00Z',
  },
];

const meta: Meta<CustomerDetailsOrdersTabComponent> = {
  title: 'Customers/CustomerDetailsOrdersTab',
  component: CustomerDetailsOrdersTabComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<CustomerDetailsOrdersTabComponent>;

export const WithOrders: Story = {
  args: {
    orders: sampleOrders,
    paging: { length: 2, skip: 0, totalCount: 2 },
    first: 0,
    pageSize: 10,
    loading: false,
  },
};

export const LoadingState: Story = {
  args: {
    orders: [],
    paging: { length: 0, skip: 0, totalCount: 0 },
    first: 0,
    pageSize: 10,
    loading: true,
  },
};

export const EmptyState: Story = {
  args: {
    orders: [],
    paging: { length: 0, skip: 0, totalCount: 0 },
    first: 0,
    pageSize: 10,
    loading: false,
  },
};

import type { Meta, StoryObj } from '@storybook/angular';
import { OrderDetailsReturnItemsTabComponent } from './order-details-return-items-tab.component';
import { OrderStatus } from '../../models/order.entity';
import { PaymentStatus, PaymentType } from '../../models/order-payment.enums';
import type { UiOrder } from '../../models/order-ui.model';
import type { Product } from '@invoria/catalog';

const sampleProduct: Product = {
  id: 'prd_1',
  name: 'Surgical Gloves (Box of 100)',
  price: 250,
  stock: { actualQuantity: 50, reservedQuantity: 0 },
  createdAt: '2026-01-01T00:00:00Z',
  createdBy: 'system',
  lastModifiedAt: '2026-01-01T00:00:00Z',
  lastModifiedBy: 'system',
};

const sampleOrder: UiOrder = {
  id: 'ord_101',
  orderNumber: 'ORD-2026-0101',
  customerName: 'Cairo Medical Supplies',
  customerId: 'cust_1',
  netOfTotalOrderAmount: 2450,
  returnsTotal: 500,
  amountDue: 1950,
  amountPaid: 2450,
  amountOutstanding: 0,
  status: OrderStatus.Completed,
  paymentStatus: PaymentStatus.Paid,
  paymentType: PaymentType.Immediate,
  orderDate: '2026-11-18T10:00:00Z',
  items: [],
  returnId: 'ret_001',
  returnItems: [
    {
      orderItemId: 'item_1',
      quantity: 2,
      productId: 'prd_1',
      orderedQuantity: 5,
      unitPrice: 250,
      lineReturnTotal: 500,
      product: sampleProduct,
    },
  ],
  orderAllocated: true,
  createdAt: '2026-11-18T10:00:00Z',
};

const meta: Meta<OrderDetailsReturnItemsTabComponent> = {
  title: 'Sales/Orders/OrderDetailsReturnItemsTab',
  component: OrderDetailsReturnItemsTabComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<OrderDetailsReturnItemsTabComponent>;

export const WithReturns: Story = {
  args: {
    order: sampleOrder,
    currencyCode: 'EGP',
  },
};

export const NoReturns: Story = {
  args: {
    order: {
      ...sampleOrder,
      returnId: undefined,
      returnItems: [],
    },
    currencyCode: 'EGP',
  },
};

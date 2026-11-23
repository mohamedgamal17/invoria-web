import type { Meta, StoryObj } from '@storybook/angular';
import { OrderDetailsLineItemsTabComponent } from './order-details-line-items-tab.component';
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
  returnsTotal: 0,
  amountDue: 2450,
  amountPaid: 2450,
  amountOutstanding: 0,
  status: OrderStatus.Completed,
  paymentStatus: PaymentStatus.Paid,
  paymentType: PaymentType.Immediate,
  orderDate: '2026-11-18T10:00:00Z',
  items: [
    {
      id: 'item_1',
      productId: 'prd_1',
      quantity: 5,
      price: 250,
      product: sampleProduct,
    },
  ],
  returnItems: [],
  orderAllocated: true,
  createdAt: '2026-11-18T10:00:00Z',
};

const meta: Meta<OrderDetailsLineItemsTabComponent> = {
  title: 'Sales/Orders/OrderDetailsLineItemsTab',
  component: OrderDetailsLineItemsTabComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<OrderDetailsLineItemsTabComponent>;

export const Default: Story = {
  args: {
    order: sampleOrder,
    currencyCode: 'EGP',
  },
};

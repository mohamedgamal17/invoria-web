import type { Meta, StoryObj } from '@storybook/angular';
import { OrderReturnItemsDialogComponent } from './order-return-items-dialog.component';
import type { OrderItem, OrderReturnItem } from '../../models/order.entity';
import type { Product } from '@invoria/catalog';

const sampleProduct: Product = {
  id: 'prd_01',
  name: 'Surgical Gloves (Box of 100)',
  price: 250,
  stock: { actualQuantity: 50, reservedQuantity: 0 },
  createdAt: '2026-01-01T00:00:00Z',
  createdBy: 'system',
  lastModifiedAt: '2026-01-01T00:00:00Z',
  lastModifiedBy: 'system',
};

const sampleOrderItems: OrderItem[] = [
  {
    id: 'item_01',
    productId: 'prd_01',
    product: sampleProduct,
    quantity: 10,
    price: 250,
  },
];

const sampleReturnItems: OrderReturnItem[] = [
  {
    orderItemId: 'item_01',
    quantity: 2,
    productId: 'prd_01',
    orderedQuantity: 10,
    unitPrice: 250,
    lineReturnTotal: 500,
    product: sampleProduct,
  },
];

const meta: Meta<OrderReturnItemsDialogComponent> = {
  title: 'Sales/Orders/OrderReturnItemsDialog',
  component: OrderReturnItemsDialogComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<OrderReturnItemsDialogComponent>;

export const Open: Story = {
  args: {
    visible: true,
    orderItems: sampleOrderItems,
    existingReturnItems: [],
    saving: false,
  },
};

export const WithExistingReturns: Story = {
  args: {
    visible: true,
    orderItems: sampleOrderItems,
    existingReturnItems: sampleReturnItems,
    saving: false,
  },
};

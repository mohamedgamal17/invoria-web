import type { Meta, StoryObj } from '@storybook/angular';
import { ProductDetailsOrdersPanelComponent } from './product-details-orders-panel.component';
import { OrderStatus } from '@invoria/sales';
import {
  EMPTY_PRODUCT_ORDERS_AGGREGATE,
  type ProductOrderRowSummary,
  type ProductOrdersAggregateSummary,
} from '../../models/product-order-summary';

const sampleRows: ProductOrderRowSummary[] = [
  {
    orderId: 'ord_1',
    orderNumber: 'ORD-2026-0089',
    orderStatusLabel: 'Completed',
    orderStatus: OrderStatus.Completed,
    productLineSubtotal: 18000,
    productReturnSubtotal: 0,
    productNetSubtotal: 18000,
    orderTotal: 24000,
    orderReturnSubtotal: 0,
    orderNetAfterReturns: 24000,
  },
  {
    orderId: 'ord_2',
    orderNumber: 'ORD-2026-0094',
    orderStatusLabel: 'Processing',
    orderStatus: OrderStatus.Processing,
    productLineSubtotal: 9000,
    productReturnSubtotal: 0,
    productNetSubtotal: 9000,
    orderTotal: 15000,
    orderReturnSubtotal: 0,
    orderNetAfterReturns: 15000,
  },
];

const sampleAggregate: ProductOrdersAggregateSummary = {
  orderCount: 2,
  productLineSubtotalTotal: 27000,
  productReturnSubtotalTotal: 0,
  productNetSubtotalTotal: 27000,
  orderTotalSum: 39000,
  orderReturnSubtotalSum: 0,
  orderNetAfterReturnsSum: 39000,
};

const meta: Meta<ProductDetailsOrdersPanelComponent> = {
  title: 'Catalog/ProductDetailsOrdersPanel',
  component: ProductDetailsOrdersPanelComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<ProductDetailsOrdersPanelComponent>;

export const WithOrders: Story = {
  args: {
    rows: sampleRows,
    aggregate: sampleAggregate,
    loading: false,
    currencyCode: 'EGP',
  },
};

export const LoadingState: Story = {
  args: {
    rows: [],
    aggregate: EMPTY_PRODUCT_ORDERS_AGGREGATE,
    loading: true,
    currencyCode: 'EGP',
  },
};

export const EmptyState: Story = {
  args: {
    rows: [],
    aggregate: EMPTY_PRODUCT_ORDERS_AGGREGATE,
    loading: false,
    currencyCode: 'EGP',
  },
};

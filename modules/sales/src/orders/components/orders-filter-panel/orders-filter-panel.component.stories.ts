import type { Meta, StoryObj } from '@storybook/angular';
import { OrdersFilterPanelComponent } from './orders-filter-panel.component';
import { OrderStatus } from '../../models/order.entity';
import { PaymentStatus, PaymentType } from '../../models/order-payment.enums';

const meta: Meta<OrdersFilterPanelComponent> = {
  title: 'Sales/Orders/OrdersFilterPanel',
  component: OrdersFilterPanelComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<OrdersFilterPanelComponent>;

export const DefaultEmpty: Story = {
  args: {
    orderNumber: '',
    status: null,
    paymentStatus: null,
    paymentType: null,
    loading: false,
  },
};

export const WithActiveFilters: Story = {
  args: {
    orderNumber: 'ORD-2026',
    status: OrderStatus.Processing,
    paymentStatus: PaymentStatus.Partial,
    paymentType: PaymentType.Debt,
    loading: false,
  },
};

export const LoadingState: Story = {
  args: {
    orderNumber: 'ORD',
    status: null,
    paymentStatus: null,
    paymentType: null,
    loading: true,
  },
};

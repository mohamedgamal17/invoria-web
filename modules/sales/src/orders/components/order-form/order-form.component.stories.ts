import type { Meta, StoryObj } from '@storybook/angular';
import { OrderFormComponent } from './order-form.component';
import type { Customer } from '@invoria/customers';
import type { Product } from '@invoria/catalog';

const sampleCustomers: Customer[] = [
  {
    id: 'cust_01',
    name: 'Cairo Medical Supplies',
    createdAt: '2026-01-01T00:00:00Z',
    createdBy: 'system',
    lastModifiedAt: '2026-01-01T00:00:00Z',
    lastModifiedBy: 'system',
  },
];

const sampleProducts: Product[] = [
  {
    id: 'prd_01',
    name: 'Surgical Gloves (Box of 100)',
    price: 250,
    stock: { actualQuantity: 50, reservedQuantity: 0 },
    createdAt: '2026-01-01T00:00:00Z',
    createdBy: 'system',
    lastModifiedAt: '2026-01-01T00:00:00Z',
    lastModifiedBy: 'system',
  },
];

const meta: Meta<OrderFormComponent> = {
  title: 'Sales/Orders/OrderForm',
  component: OrderFormComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<OrderFormComponent>;

export const CreateMode: Story = {
  args: {
    mode: 'create',
    orderNumber: 'ORD-2026-NEW',
    totalAmount: 0,
    saving: false,
    customers: sampleCustomers,
    isCustomerLoading: false,
    products: sampleProducts,
    isProductLoading: false,
    initialCustomer: null,
  },
};

export const EditMode: Story = {
  args: {
    mode: 'edit',
    orderNumber: 'ORD-2026-0101',
    totalAmount: 2450,
    saving: false,
    customers: sampleCustomers,
    isCustomerLoading: false,
    products: sampleProducts,
    isProductLoading: false,
    initialCustomer: sampleCustomers[0],
  },
};

import type { Meta, StoryObj } from '@storybook/angular';
import { ProductListComponent } from './product-list.component';
import type { Product } from '../../models/product.entity';

const sampleProducts: Product[] = [
  {
    id: 'prd_1',
    name: 'Wireless Ergonomic Mouse',
    price: 650,
    stock: { actualQuantity: 45, reservedQuantity: 5 },
    createdAt: '2026-03-01T10:00:00Z',
    createdBy: 'system',
    lastModifiedAt: '2026-10-15T11:00:00Z',
    lastModifiedBy: 'system',
  },
  {
    id: 'prd_2',
    name: 'Mechanical Gaming Keyboard RGB',
    price: 1850,
    stock: { actualQuantity: 3, reservedQuantity: 3 },
    createdAt: '2026-04-12T08:30:00Z',
    createdBy: 'system',
    lastModifiedAt: '2026-11-01T14:20:00Z',
    lastModifiedBy: 'system',
  },
  {
    id: 'prd_3',
    name: '4K UltraHD Webcam with Mic',
    price: 2400,
    stock: { actualQuantity: 0, reservedQuantity: 0 },
    createdAt: '2026-05-20T12:00:00Z',
    createdBy: 'system',
    lastModifiedAt: '2026-11-10T09:45:00Z',
    lastModifiedBy: 'system',
  },
];

const meta: Meta<ProductListComponent> = {
  title: 'Catalog/ProductList',
  component: ProductListComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<ProductListComponent>;

export const WithProducts: Story = {
  args: {
    products: sampleProducts,
    totalRecords: 3,
    first: 0,
    pageSize: 10,
    isListLoading: false,
  },
};

export const LoadingState: Story = {
  args: {
    products: [],
    totalRecords: 0,
    first: 0,
    pageSize: 5,
    isListLoading: true,
  },
};

export const EmptyState: Story = {
  args: {
    products: [],
    totalRecords: 0,
    first: 0,
    pageSize: 10,
    isListLoading: false,
  },
};

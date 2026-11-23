import type { Meta, StoryObj } from '@storybook/angular';
import { ProductDetailsInfoPanelComponent } from './product-details-info-panel.component';
import type { Product } from '../../models/product.entity';

const sampleProduct: Product = {
  id: 'prd_100',
  name: 'Ergonomic Office Chair Pro',
  price: 4500,
  stock: {
    actualQuantity: 28,
    reservedQuantity: 6,
  },
  createdAt: '2026-05-10T09:00:00Z',
  createdBy: 'admin',
  lastModifiedAt: '2026-10-12T15:30:00Z',
  lastModifiedBy: 'admin',
};

const meta: Meta<ProductDetailsInfoPanelComponent> = {
  title: 'Catalog/ProductDetailsInfoPanel',
  component: ProductDetailsInfoPanelComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<ProductDetailsInfoPanelComponent>;

export const Default: Story = {
  args: {
    product: sampleProduct,
  },
};

export const OutOfStock: Story = {
  args: {
    product: {
      ...sampleProduct,
      name: 'Standing Desk Converter',
      price: 3200,
      stock: {
        actualQuantity: 0,
        reservedQuantity: 0,
      },
    },
  },
};

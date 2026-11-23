import type { Meta, StoryObj } from '@storybook/angular';
import { ProductHeaderComponent } from './product-header.component';

const meta: Meta<ProductHeaderComponent> = {
  title: 'Catalog/ProductHeader',
  component: ProductHeaderComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<ProductHeaderComponent>;

export const Default: Story = {};

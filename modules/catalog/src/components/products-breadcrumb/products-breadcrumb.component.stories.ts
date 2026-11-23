import type { Meta, StoryObj } from '@storybook/angular';
import { applicationConfig } from '@storybook/angular';
import { provideRouter } from '@angular/router';
import { ProductsBreadcrumbComponent } from './products-breadcrumb.component';

const meta: Meta<ProductsBreadcrumbComponent> = {
  title: 'Catalog/ProductsBreadcrumb',
  component: ProductsBreadcrumbComponent,
  tags: ['autodocs'],
  decorators: [
    applicationConfig({
      providers: [provideRouter([])],
    }),
  ],
};

export default meta;
type Story = StoryObj<ProductsBreadcrumbComponent>;

export const Default: Story = {
  args: {
    items: [
      { label: 'Catalog', routerLink: ['/catalog'] },
      { label: 'Products', routerLink: ['/catalog/products'] },
      { label: 'Logitech MX Master 3S' },
    ],
  },
};

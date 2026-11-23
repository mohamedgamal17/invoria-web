import type { Meta, StoryObj } from '@storybook/angular';
import { CustomerHeaderComponent } from './customer-header.component';

const meta: Meta<CustomerHeaderComponent> = {
  title: 'Customers/CustomerHeader',
  component: CustomerHeaderComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<CustomerHeaderComponent>;

export const Default: Story = {};

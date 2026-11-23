import type { Meta, StoryObj } from '@storybook/angular';
import { DetailsToolbarComponent } from './details-toolbar.component';

const meta: Meta<DetailsToolbarComponent> = {
  title: 'UI/DetailsToolbar',
  component: DetailsToolbarComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<DetailsToolbarComponent>;

export const WithTitleAndDescription: Story = {
  args: {
    title: 'Customer Details',
    description: 'View customer profile, orders history, and balances',
    backLabel: 'Back to Customers',
  },
};

export const MinimalBackOnly: Story = {
  args: {
    title: '',
    description: '',
    backLabel: 'Back',
  },
};

export const CustomBackLabel: Story = {
  args: {
    title: 'Order #ORD-2026-089',
    description: 'Submitted on 12 Nov 2026',
    backLabel: 'Return to Orders List',
  },
};

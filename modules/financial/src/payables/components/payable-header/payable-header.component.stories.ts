import type { Meta, StoryObj } from '@storybook/angular';
import { PayableHeaderComponent } from './payable-header.component';

const meta: Meta<PayableHeaderComponent> = {
  title: 'Financial/Payables/PayableHeader',
  component: PayableHeaderComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<PayableHeaderComponent>;

export const Default: Story = {};

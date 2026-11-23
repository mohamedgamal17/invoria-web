import type { Meta, StoryObj } from '@storybook/angular';
import { ReturnDetailsLinesComponent } from './return-details-lines.component';
import type { ReturnLine } from '../../models/return.entity';

const sampleLines: ReturnLine[] = [
  {
    id: 'line_1',
    returnId: 'ret_1',
    orderItemId: 'item_1',
    productId: 'prd_1',
    quantity: 2,
    product: { id: 'prd_1', name: 'Wireless Mouse', price: 650 },
  },
  {
    id: 'line_2',
    returnId: 'ret_1',
    orderItemId: 'item_2',
    productId: 'prd_2',
    quantity: 1,
    product: { id: 'prd_2', name: 'Mechanical Keyboard', price: 1850 },
  },
];

const meta: Meta<ReturnDetailsLinesComponent> = {
  title: 'Sales/Returns/ReturnDetailsLines',
  component: ReturnDetailsLinesComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<ReturnDetailsLinesComponent>;

export const Default: Story = {
  args: {
    returnLines: sampleLines,
  },
};

export const Empty: Story = {
  args: {
    returnLines: [],
  },
};

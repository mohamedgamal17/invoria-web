import type { Meta, StoryObj } from '@storybook/angular';
import { ReturnListComponent } from './return-list.component';
import { ReturnStatus } from '../../models/return-status.enum';
import type { Return } from '../../models/return.entity';

const sampleReturns: Return[] = [
  {
    id: 'ret_1',
    type: 1,
    status: ReturnStatus.Completed,
    allocationId: 'alloc_1',
    orderId: 'ord_1',
    returnLines: [
      {
        id: 'line_1',
        returnId: 'ret_1',
        orderItemId: 'item_1',
        productId: 'prd_1',
        quantity: 2,
        product: { id: 'prd_1', name: 'Wireless Mouse', price: 650 },
      },
    ],
    createdAt: '2026-11-12T10:00:00Z',
    createdBy: 'system',
    lastModifiedAt: '2026-11-14T15:00:00Z',
    lastModifiedBy: 'system',
  },
  {
    id: 'ret_2',
    type: 1,
    status: ReturnStatus.Pending,
    allocationId: null,
    orderId: 'ord_2',
    returnLines: [
      {
        id: 'line_2',
        returnId: 'ret_2',
        orderItemId: 'item_2',
        productId: 'prd_2',
        quantity: 1,
        product: { id: 'prd_2', name: 'Mechanical Keyboard', price: 1850 },
      },
    ],
    createdAt: '2026-11-18T11:30:00Z',
    createdBy: 'system',
    lastModifiedAt: '2026-11-18T11:30:00Z',
    lastModifiedBy: 'system',
  },
];

const meta: Meta<ReturnListComponent> = {
  title: 'Sales/Returns/ReturnList',
  component: ReturnListComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<ReturnListComponent>;

export const WithReturns: Story = {
  args: {
    returns: sampleReturns,
    totalRecords: 2,
    first: 0,
    pageSize: 10,
    isListLoading: false,
  },
};

export const LoadingState: Story = {
  args: {
    returns: [],
    totalRecords: 0,
    first: 0,
    pageSize: 5,
    isListLoading: true,
  },
};

export const EmptyState: Story = {
  args: {
    returns: [],
    totalRecords: 0,
    first: 0,
    pageSize: 10,
    isListLoading: false,
  },
};

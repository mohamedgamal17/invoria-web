import type { Meta, StoryObj } from '@storybook/angular';
import { BatchListComponent } from './batch-list.component';
import { BatchState } from '../models/batch.entity';
import type { Batch } from '../models/batch.entity';

const sampleBatches: Batch[] = [
  {
    id: 'bat_1',
    productId: 'prd_100',
    quantity: 50,
    reservedQuantity: 10,
    purchasePrice: 280,
    state: BatchState.Active,
    createdAt: '2026-10-01T08:00:00Z',
    createdBy: 'system',
    lastModifiedAt: '2026-11-01T10:00:00Z',
    lastModifiedBy: 'system',
  },
  {
    id: 'bat_2',
    productId: 'prd_100',
    quantity: 30,
    reservedQuantity: 30,
    purchasePrice: 275,
    state: BatchState.Depleted,
    createdAt: '2026-09-15T09:00:00Z',
    createdBy: 'system',
    lastModifiedAt: '2026-10-20T12:00:00Z',
    lastModifiedBy: 'system',
  },
  {
    id: 'bat_3',
    productId: 'prd_100',
    quantity: 15,
    reservedQuantity: 0,
    purchasePrice: 290,
    state: BatchState.Disabled,
    createdAt: '2026-08-10T11:00:00Z',
    createdBy: 'system',
    lastModifiedAt: '2026-09-01T15:00:00Z',
    lastModifiedBy: 'system',
  },
];

const meta: Meta<BatchListComponent> = {
  title: 'Inventory/BatchList',
  component: BatchListComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<BatchListComponent>;

export const WithBatches: Story = {
  args: {
    batches: sampleBatches,
    totalRecords: 3,
    first: 0,
    pageSize: 10,
    loading: false,
    currencyCode: 'EGP',
  },
};

export const LoadingState: Story = {
  args: {
    batches: [],
    totalRecords: 0,
    first: 0,
    pageSize: 5,
    loading: true,
    currencyCode: 'EGP',
  },
};

export const EmptyState: Story = {
  args: {
    batches: [],
    totalRecords: 0,
    first: 0,
    pageSize: 10,
    loading: false,
    currencyCode: 'EGP',
  },
};

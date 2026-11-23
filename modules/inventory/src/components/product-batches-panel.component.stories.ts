import type { Meta, StoryObj } from '@storybook/angular';
import { ProductBatchesPanelComponent } from './product-batches-panel.component';
import { BatchState, type Batch } from '../models/batch.entity';

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
];

const meta: Meta<ProductBatchesPanelComponent> = {
  title: 'Inventory/ProductBatchesPanel',
  component: ProductBatchesPanelComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<ProductBatchesPanelComponent>;

export const Default: Story = {
  args: {
    batches: sampleBatches,
    loading: false,
    saving: false,
    totalRecords: sampleBatches.length,
    first: 0,
    pageSize: 25,
  },
};

export const LoadingState: Story = {
  args: {
    batches: [],
    loading: true,
    saving: false,
    totalRecords: 0,
    first: 0,
    pageSize: 25,
  },
};

export const EmptyState: Story = {
  args: {
    batches: [],
    loading: false,
    saving: false,
    totalRecords: 0,
    first: 0,
    pageSize: 25,
  },
};

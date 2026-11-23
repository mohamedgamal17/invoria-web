import type { Meta, StoryObj } from '@storybook/angular';
import { BatchFormComponent } from './batch-form.component';
import { BatchState, type Batch } from '../models/batch.entity';

const sampleBatch: Batch = {
  id: 'bat_01',
  productId: 'prd_01',
  quantity: 45,
  reservedQuantity: 5,
  purchasePrice: 320,
  state: BatchState.Active,
  createdAt: '2026-10-01T08:00:00Z',
  createdBy: 'admin',
  lastModifiedAt: '2026-10-02T08:00:00Z',
  lastModifiedBy: 'admin',
};

const meta: Meta<BatchFormComponent> = {
  title: 'Inventory/BatchForm',
  component: BatchFormComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<BatchFormComponent>;

export const CreateMode: Story = {
  args: {
    batch: null,
    loading: false,
    currencyCode: 'EGP',
  },
};

export const EditMode: Story = {
  args: {
    batch: sampleBatch,
    loading: false,
    currencyCode: 'EGP',
  },
};

export const LoadingState: Story = {
  args: {
    batch: sampleBatch,
    loading: true,
    currencyCode: 'EGP',
  },
};

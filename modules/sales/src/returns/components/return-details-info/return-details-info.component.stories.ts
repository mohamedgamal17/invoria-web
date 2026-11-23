import type { Meta, StoryObj } from '@storybook/angular';
import { ReturnDetailsInfoComponent } from './return-details-info.component';
import { ReturnStatus } from '../../models/return-status.enum';
import type { Return } from '../../models/return.entity';

const sampleReturn: Return = {
  id: 'ret_001',
  type: 1,
  status: ReturnStatus.Completed,
  allocationId: 'alloc_001',
  orderId: 'ord_1001',
  returnLines: [],
  createdAt: '2026-11-12T10:00:00Z',
  createdBy: 'system',
  lastModifiedAt: '2026-11-14T15:00:00Z',
  lastModifiedBy: 'system',
};

const meta: Meta<ReturnDetailsInfoComponent> = {
  title: 'Sales/Returns/ReturnDetailsInfo',
  component: ReturnDetailsInfoComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<ReturnDetailsInfoComponent>;

export const Completed: Story = {
  args: {
    return: sampleReturn,
  },
};

export const Pending: Story = {
  args: {
    return: {
      ...sampleReturn,
      id: 'ret_002',
      status: ReturnStatus.Pending,
      allocationId: null,
    },
  },
};

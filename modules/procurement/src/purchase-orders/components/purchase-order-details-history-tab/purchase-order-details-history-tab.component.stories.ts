import type { Meta, StoryObj } from '@storybook/angular';
import {
  PurchaseOrderDetailsHistoryTabComponent,
  type PurchaseOrderStateTimelineRow,
} from './purchase-order-details-history-tab.component';

const sampleEvents: PurchaseOrderStateTimelineRow[] = [
  {
    fromLabel: 'Draft',
    toLabel: 'Approved',
    severity: 'info',
    changedAt: '2026-11-15T09:30:00Z',
    reason: 'Approved by procurement manager',
  },
  {
    fromLabel: 'Approved',
    toLabel: 'Completed',
    severity: 'success',
    changedAt: '2026-11-16T14:00:00Z',
    reason: 'Goods received and inspected',
  },
];

const meta: Meta<PurchaseOrderDetailsHistoryTabComponent> = {
  title: 'Procurement/PurchaseOrders/PurchaseOrderDetailsHistoryTab',
  component: PurchaseOrderDetailsHistoryTabComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<PurchaseOrderDetailsHistoryTabComponent>;

export const Default: Story = {
  args: {
    events: sampleEvents,
  },
};

export const Empty: Story = {
  args: {
    events: [],
  },
};

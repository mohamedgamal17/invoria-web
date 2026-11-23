import type { Meta, StoryObj } from '@storybook/angular';
import { PurchaseOrderDetailsOverviewTabComponent } from './purchase-order-details-overview-tab.component';
import { PurchaseState } from '../../enums/purchase-state.enum';
import type { PurchaseOrder } from '../../models/purchase-order.entity';

const sampleOrder: PurchaseOrder = {
  id: 'po_01',
  purchaseNumber: 'PO-2026-001',
  supplierId: 'sup_01',
  supplier: { id: 'sup_01', name: 'El-Sewedy Electrical Solutions' },
  state: PurchaseState.Completed,
  completedDate: '2026-11-12T10:00:00Z',
  subTotal: 65000,
  totalAmount: 74100,
  createdAt: '2026-11-01T08:00:00Z',
  createdBy: 'system',
  lastModifiedAt: '2026-11-12T10:00:00Z',
  lastModifiedBy: 'system',
};

const meta: Meta<PurchaseOrderDetailsOverviewTabComponent> = {
  title: 'Procurement/PurchaseOrders/PurchaseOrderDetailsOverviewTab',
  component: PurchaseOrderDetailsOverviewTabComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<PurchaseOrderDetailsOverviewTabComponent>;

export const Default: Story = {
  args: {
    purchaseOrder: sampleOrder,
    currencyCode: 'EGP',
    supplierLine: 'El-Sewedy Electrical Solutions',
  },
};

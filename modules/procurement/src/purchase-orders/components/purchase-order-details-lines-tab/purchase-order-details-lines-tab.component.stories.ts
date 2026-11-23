import type { Meta, StoryObj } from '@storybook/angular';
import { PurchaseOrderDetailsLinesTabComponent } from './purchase-order-details-lines-tab.component';
import { PurchaseState } from '../../enums/purchase-state.enum';
import type { PurchaseOrder, PurchaseOrderItem } from '../../models/purchase-order.entity';

const sampleOrder: PurchaseOrder = {
  id: 'po_01',
  purchaseNumber: 'PO-2026-001',
  supplierId: 'sup_01',
  supplier: { id: 'sup_01', name: 'El-Sewedy Electrical Solutions' },
  state: PurchaseState.Completed,
  subTotal: 65000,
  totalAmount: 74100,
  createdAt: '2026-11-01T08:00:00Z',
  createdBy: 'system',
  lastModifiedAt: '2026-11-12T10:00:00Z',
  lastModifiedBy: 'system',
  purchaseOrderItems: [
    {
      id: 'poi_1',
      productId: 'prd_1',
      productName: 'Copper Cables 10mm',
      quantity: 50,
      unitPrice: 900,
      lineTotal: 45000,
    },
    {
      id: 'poi_2',
      productId: 'prd_2',
      productName: 'Circuit Breakers 32A',
      quantity: 20,
      unitPrice: 1000,
      lineTotal: 20000,
    },
  ],
};

const meta: Meta<PurchaseOrderDetailsLinesTabComponent> = {
  title: 'Procurement/PurchaseOrders/PurchaseOrderDetailsLinesTab',
  component: PurchaseOrderDetailsLinesTabComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<PurchaseOrderDetailsLinesTabComponent>;

export const Default: Story = {
  args: {
    purchaseOrder: sampleOrder,
    currencyCode: 'EGP',
    lineLabel: (line: PurchaseOrderItem) => line.productName ?? line.productId,
  },
};

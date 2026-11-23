import type { Meta, StoryObj } from '@storybook/angular';
import { applicationConfig } from '@storybook/angular';
import { provideRouter } from '@angular/router';
import { SupplierDetailsPurchaseOrdersTabComponent } from './supplier-details-purchase-orders-tab.component';
import { PurchaseState } from '../../../purchase-orders/enums/purchase-state.enum';
import type { PurchaseOrder } from '../../../purchase-orders/models/purchase-order.entity';

const sampleOrders: PurchaseOrder[] = [
  {
    id: 'po_1',
    purchaseNumber: 'PO-2026-001',
    supplierId: 'sup_1',
    supplier: { id: 'sup_1', name: 'El-Sewedy Electrical Solutions' },
    state: PurchaseState.Completed,
    subTotal: 65000,
    totalAmount: 74100,
    completedDate: '2026-11-12T10:00:00Z',
    createdAt: '2026-11-01T08:00:00Z',
    createdBy: 'system',
    lastModifiedAt: '2026-11-12T10:00:00Z',
    lastModifiedBy: 'system',
  },
  {
    id: 'po_2',
    purchaseNumber: 'PO-2026-002',
    supplierId: 'sup_1',
    supplier: { id: 'sup_1', name: 'El-Sewedy Electrical Solutions' },
    state: PurchaseState.Approved,
    subTotal: 28000,
    totalAmount: 31920,
    createdAt: '2026-11-15T09:30:00Z',
    createdBy: 'system',
    lastModifiedAt: '2026-11-16T14:00:00Z',
    lastModifiedBy: 'system',
  },
];

const meta: Meta<SupplierDetailsPurchaseOrdersTabComponent> = {
  title: 'Procurement/Suppliers/SupplierDetailsPurchaseOrdersTab',
  component: SupplierDetailsPurchaseOrdersTabComponent,
  tags: ['autodocs'],
  decorators: [
    applicationConfig({
      providers: [provideRouter([])],
    }),
  ],
};

export default meta;
type Story = StoryObj<SupplierDetailsPurchaseOrdersTabComponent>;

export const Default: Story = {
  args: {
    purchaseOrders: sampleOrders,
    paging: { length: sampleOrders.length, skip: 0, totalCount: sampleOrders.length },
    first: 0,
    pageSize: 25,
    loading: false,
    purchaseNumber: '',
    statusFilter: null,
  },
};

export const Loading: Story = {
  args: {
    purchaseOrders: [],
    paging: { length: 0, skip: 0, totalCount: 0 },
    first: 0,
    pageSize: 25,
    loading: true,
    purchaseNumber: '',
    statusFilter: null,
  },
};

export const Empty: Story = {
  args: {
    purchaseOrders: [],
    paging: { length: 0, skip: 0, totalCount: 0 },
    first: 0,
    pageSize: 25,
    loading: false,
    purchaseNumber: '',
    statusFilter: null,
  },
};

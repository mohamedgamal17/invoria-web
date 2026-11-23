import type { Meta, StoryObj } from '@storybook/angular';
import { PurchaseOrderListComponent } from './purchase-order-list.component';
import { PurchaseState } from '../../enums/purchase-state.enum';
import type { PurchaseOrder } from '../../models/purchase-order.entity';

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
    supplierId: 'sup_2',
    supplier: { id: 'sup_2', name: 'Alexandria Paper & Packaging Co' },
    state: PurchaseState.Approved,
    subTotal: 28000,
    totalAmount: 31920,
    createdAt: '2026-11-15T09:30:00Z',
    createdBy: 'system',
    lastModifiedAt: '2026-11-16T14:00:00Z',
    lastModifiedBy: 'system',
  },
  {
    id: 'po_3',
    purchaseNumber: 'PO-2026-003',
    supplierId: 'sup_3',
    supplier: { id: 'sup_3', name: 'Nile Chemical Industries' },
    state: PurchaseState.Draft,
    subTotal: 15400,
    totalAmount: 17556,
    createdAt: '2026-11-20T11:00:00Z',
    createdBy: 'system',
    lastModifiedAt: '2026-11-20T11:00:00Z',
    lastModifiedBy: 'system',
  },
];

const meta: Meta<PurchaseOrderListComponent> = {
  title: 'Procurement/PurchaseOrders/PurchaseOrderList',
  component: PurchaseOrderListComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<PurchaseOrderListComponent>;

export const WithOrders: Story = {
  args: {
    purchaseOrders: sampleOrders,
    totalRecords: 3,
    first: 0,
    pageSize: 10,
    loading: false,
    showSupplierColumn: true,
  },
};

export const WithoutSupplierColumn: Story = {
  args: {
    purchaseOrders: sampleOrders,
    totalRecords: 3,
    first: 0,
    pageSize: 10,
    loading: false,
    showSupplierColumn: false,
  },
};

export const LoadingState: Story = {
  args: {
    purchaseOrders: [],
    totalRecords: 0,
    first: 0,
    pageSize: 5,
    loading: true,
    showSupplierColumn: true,
  },
};

export const EmptyState: Story = {
  args: {
    purchaseOrders: [],
    totalRecords: 0,
    first: 0,
    pageSize: 10,
    loading: false,
    showSupplierColumn: true,
  },
};

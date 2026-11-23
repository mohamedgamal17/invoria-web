import type { Meta, StoryObj } from '@storybook/angular';
import { PurchaseOrderFormComponent } from './purchase-order-form.component';
import type { SupplierChoice } from '../../../suppliers/models/supplier.entity';
import type { Product } from '@invoria/catalog';

const sampleSuppliers: SupplierChoice[] = [
  { id: 'sup_01', name: 'El-Sewedy Electrical Solutions' },
  { id: 'sup_02', name: 'Alexandria Paper & Packaging Co' },
];

const sampleProducts: Product[] = [
  {
    id: 'prd_01',
    name: 'Copper Cables 10mm',
    price: 900,
    stock: { actualQuantity: 100, reservedQuantity: 0 },
    createdAt: '2026-01-01T00:00:00Z',
    createdBy: 'system',
    lastModifiedAt: '2026-01-01T00:00:00Z',
    lastModifiedBy: 'system',
  },
];

const meta: Meta<PurchaseOrderFormComponent> = {
  title: 'Procurement/PurchaseOrders/PurchaseOrderForm',
  component: PurchaseOrderFormComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<PurchaseOrderFormComponent>;

export const CreateMode: Story = {
  args: {
    mode: 'create',
    purchaseNumber: 'PO-2026-NEW',
    saving: false,
    suppliers: sampleSuppliers,
    resolvedSupplier: null,
    products: sampleProducts,
    isProductLoading: false,
    initialItems: [],
  },
};

export const EditMode: Story = {
  args: {
    mode: 'edit',
    purchaseNumber: 'PO-2026-001',
    saving: false,
    suppliers: sampleSuppliers,
    resolvedSupplier: { id: 'sup_01', name: 'El-Sewedy Electrical Solutions' },
    products: sampleProducts,
    isProductLoading: false,
    initialItems: [
      {
        productId: 'prd_01',
        productName: 'Copper Cables 10mm',
        quantity: 50,
        unitPrice: 900,
      },
    ],
  },
};

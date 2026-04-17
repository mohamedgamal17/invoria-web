import { Entity } from '../../../core/models/entity';

import type { PurchaseState } from '../enums/purchase-state.enum';

/** `InvoriaProcurementContractsDtosPurchaseOrderItemDto` (camelCase JSON). */
export interface PurchaseOrderItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  supplierProductCode?: string | null;
  lineTotal: number;
}

/** `InvoriaProcurementContractsDtosPurchaseOrderDto` (camelCase JSON). */
export interface PurchaseOrder extends Entity {
  purchaseNumber: string;
  supplierId: string;
  state: PurchaseState;
  orderDate?: string | null;
  expectedDeliveryDate?: string | null;
  completedDate?: string | null;
  subTotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  /** Omitted or empty when list is fetched with `IncludePurchaseItems: false`. */
  purchaseOrderItems?: PurchaseOrderItem[];
}

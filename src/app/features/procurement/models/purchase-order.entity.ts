import { Entity } from '../../../core/models/entity';

import type { PurchaseState } from '../enums/purchase-state.enum';

/** `InvoriaProcurementContractsDtosPurchaseOrderItemDto` (camelCase JSON). */
export interface PurchaseOrderItem {
  id: string;
  productId: string;
  /** When present on the DTO, shown as the product label without an extra catalog request. */
  productName?: string | null;
  quantity: number;
  unitPrice: number;
  supplierProductCode?: string | null;
  lineTotal: number;
}

/** Populated when list/detail is requested with `IncludeSupplier: true`. */
export interface PurchaseOrderSupplierRef {
  id: string;
  supplierCode?: string;
  name: string;
}

/**
 * One workflow step on a purchase order (`InvoriaProcurementContracts` history entry; camelCase JSON).
 * `fromState` may be omitted for the initial transition (e.g. creation into Draft).
 */
export interface PurchaseOrderStateTransition {
  fromState?: PurchaseState | null;
  toState: PurchaseState;
  /** ISO 8601 instant when the transition was recorded. */
  changedAt: string;
  reason?: string | null;
}

/** `InvoriaProcurementContractsDtosPurchaseOrderDto` (camelCase JSON). */
export interface PurchaseOrder extends Entity {
  purchaseNumber: string;
  supplierId: string;
  supplier?: PurchaseOrderSupplierRef | null;
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
  /** Embedded state transition log when returned by the API. */
  stateHistory?: PurchaseOrderStateTransition[];
}

/** Mock/UI line item for purchase order create/edit flows. */
export interface UiPurchaseOrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  supplierProductCode?: string | null;
}

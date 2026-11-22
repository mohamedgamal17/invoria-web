/** Query-string filters of the purchase-orders list (shared with supplier details). */
export interface PurchaseOrdersListFilters {
  purchaseNumber: string;
  status: number | null;
}

/** Query-string filters of the payables list. */
export interface PayablesListFilters {
  supplierId: string;
  sourceId: string;
  isPaid: boolean | null;
}

/** Minimal supplier shape used by the payables supplier filter. */
export interface SupplierRef {
  id: string;
  name: string;
}

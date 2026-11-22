import type { SupplierRef } from '@invoria/event-bus';

/** Query-string filters of the payables list. */
export interface PayablesListFilters {
  supplierId: string;
  sourceId: string;
  isPaid: boolean | null;
}

/** Re-export minimal supplier shape used by the payables supplier filter. */
export type { SupplierRef };

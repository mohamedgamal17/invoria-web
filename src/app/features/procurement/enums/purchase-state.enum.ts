/** `InvoriaProcurementContractsPurchaseOrdersPurchaseState` (integer enum). */
export enum PurchaseState {
  Draft = 1,
  Submitted = 2,
  Approved = 3,
  Reopened = 4,
  Completed = 5,
  Cancelled = 6,
  Rejected = 7,
}

/** Numeric `PurchaseState` values (excludes the enum's reverse-mapping keys) for query-param validation. */
export const PURCHASE_STATE_VALUES: readonly number[] = Object.values(PurchaseState).filter(
  (value): value is number => typeof value === 'number',
);

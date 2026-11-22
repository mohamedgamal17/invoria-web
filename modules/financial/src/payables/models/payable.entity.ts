import type {
  FinancialObligation,
  FinancialObligationPartyRef,
  FinancialObligationSourceRef,
} from '@invoria/utils';

/**
 * Minimal read-only reference for the optional inline `Party`
 * (`SupplierDto`) that the payables UI hydrates client-side.
 * `PayableDto` wires `partyId`/`sourceId` only — no inline
 * party/source — so these refs are resolved via the suppliers
 * and purchase orders API services (see docs/architecture/overview.md exceptions).
 */
export interface PayablePartyRef extends FinancialObligationPartyRef {
  id: string;
  name: string;
}

/**
 * Optional inline `Source` reference hydrated client-side from
 * `PurchaseOrderDto` (`purchaseNumber`) for display purposes.
 */
export interface PayableSourceRef extends FinancialObligationSourceRef {
  id: string;
  purchaseNumber: string;
}

export interface PayableSettlement {
  id: string;
  payableId: string;
  amount: number;
  settledAt: string;
}

export interface Payable extends FinancialObligation {
  /**
   * Wire name `partyId`.
   * Currently always references a supplier (`/suppliers/:partyId`).
   */
  partyId: string;
  /**
   * Wire name `sourceId`.
   * Currently always references a purchase order (`/purchase-orders/:sourceId`).
   */
  sourceId: string;
  /** Optional inline party ref (supplier name), hydrated client-side. */
  party?: PayablePartyRef | null;
  /** Optional inline source ref (purchase order number), hydrated client-side. */
  source?: PayableSourceRef | null;
  settlements: PayableSettlement[];
}

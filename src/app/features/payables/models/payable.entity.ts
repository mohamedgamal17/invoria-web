import type { Entity } from '../../../core/models/entity';
import type { FinancialObligationStatus } from './payable-status.enum';

/**
 * Minimal read-only reference for the optional inline `Party`
 * (`SupplierDto`) that the payables UI hydrates client-side.
 * `PayableDto` wires `PartyId`/`SourceId` only — no inline
 * party/source — so these refs are resolved via the suppliers
 * and purchase orders API services (see ARCHITECTURE.md exceptions).
 */
export interface PayablePartyRef {
  id: string;
  name: string;
}

/**
 * Optional inline `Source` reference hydrated client-side from
 * `PurchaseOrderDto` (`purchaseNumber`) for display purposes.
 */
export interface PayableSourceRef {
  id: string;
  purchaseNumber: string;
}

export interface PayableSettlement {
  id: string;
  payableId: string;
  amount: number;
  settledAt: string;
}

export interface Payable extends Entity {
  /**
   * Wire name `PartyId`.
   * Currently always references a supplier (`/suppliers/:partyId`).
   */
  partyId: string;
  /**
   * Wire name `SourceId`.
   * Currently always references a purchase order (`/purchase-orders/:sourceId`).
   */
  sourceId: string;
  /** Optional inline party ref (supplier name), hydrated client-side. */
  party?: PayablePartyRef | null;
  /** Optional inline source ref (purchase order number), hydrated client-side. */
  source?: PayableSourceRef | null;
  amount: number;
  outstandingAmount: number;
  status: FinancialObligationStatus;
  settlements: PayableSettlement[];
}

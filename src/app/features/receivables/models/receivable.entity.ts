import type { Entity } from '../../../core/models/entity';
import type { FinancialObligationStatus } from './receivable-status.enum';

/**
 * Minimal read-only reference for the optional inline `Party`
 * (`CustomerDto`) returned by the receivables API.
 */
export interface ReceivablePartyRef {
  id: string;
  name: string;
}

/**
 * Minimal read-only reference for the optional inline `Source`
 * (`PublicOrderDto`) returned by the receivables API.
 */
export interface ReceivableOrderRef {
  id: string;
  orderNumber: string;
}

export interface ReceivableSettlement {
  id: string;
  receivableId: string;
  amount: number;
  settledAt: string;
}

export interface Receivable extends Entity {
  /**
   * Wire name `PartyId`.
   * Currently always references a customer (`/customers/:partyId`).
   */
  partyId: string;
  /**
   * Wire name `SourceId`.
   * Currently always references an order (`/orders/:sourceId`).
   */
  sourceId: string;
  /** Optional inline party (`CustomerDto`) with the display name. */
  party?: ReceivablePartyRef | null;
  /** Optional inline source order (`PublicOrderDto`) with the order number. */
  source?: ReceivableOrderRef | null;
  amount: number;
  outstandingAmount: number;
  status: FinancialObligationStatus;
  settlements: ReceivableSettlement[];
}

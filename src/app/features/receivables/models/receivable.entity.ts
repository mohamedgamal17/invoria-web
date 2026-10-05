import type { Entity } from '../../../core/models/entity';
import type { FinancialObligationStatus } from './receivable-status.enum';

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
  amount: number;
  outstandingAmount: number;
  status: FinancialObligationStatus;
  settlements: ReceivableSettlement[];
}

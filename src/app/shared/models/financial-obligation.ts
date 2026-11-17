import type { Entity } from '../../core/models/entity';
import type { FinancialObligationStatus } from './financial-obligation-status';

export interface FinancialObligationPartyRef {
  id: string;
  name: string;
}

export interface FinancialObligationSourceRef {
  id: string;
  purchaseNumber?: string;
  orderNumber?: string;
}

export interface FinancialObligation extends Entity {
  partyId: string;
  sourceId: string;
  party?: FinancialObligationPartyRef | null;
  source?: FinancialObligationSourceRef | null;
  amount: number;
  outstandingAmount: number;
  status: FinancialObligationStatus;
}

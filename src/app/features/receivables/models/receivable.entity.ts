import type { Entity } from '../../../core/models/entity';
import type { FinancialObligationStatus } from './receivable-status.enum';
import type { OrderStatus } from '../../orders/models/order.entity';
import type { PaymentType } from '../../orders/models/order-payment.enums';

/**
 * Minimal read-only reference for the optional inline `Party`
 * (`CustomerDto`) returned by the receivables API.
 */
export interface ReceivablePartyRef {
  id: string;
  name: string;
}

/**
 * Full read-only shape of the optional inline `Source`
 * (`PublicOrderDto`) returned by the receivables API.
 * Enum values reference the `orders` feature contracts (`import type` only).
 */
export interface ReceivableSource {
  id: string;
  orderNumber: string;
  customerId: string;
  status: OrderStatus;
  paymentType: PaymentType;
  subtotalAmount: number;
  returnsAmount: number;
  netOrderAmount: number;
  amountOutstanding: number;
  allocationId?: string | null;
  returnId?: string | null;
  invoiceId?: string | null;
  orderAllocated: boolean;
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
  /** Optional inline source order (`PublicOrderDto`) with the full order summary. */
  source?: ReceivableSource | null;
  amount: number;
  outstandingAmount: number;
  status: FinancialObligationStatus;
  settlements: ReceivableSettlement[];
}

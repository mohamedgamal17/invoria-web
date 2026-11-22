import type {
  FinancialObligation,
  FinancialObligationPartyRef,
  FinancialObligationSourceRef,
} from '@invoria/utils';
import type { OrderStatus } from '@invoria/sales';
import type { PaymentType } from '@invoria/sales';

/**
 * Minimal read-only reference for the optional inline `Party`
 * (`CustomerDto`) returned by the receivables API.
 */
export interface ReceivablePartyRef extends FinancialObligationPartyRef {
  id: string;
  name: string;
}

/**
 * Full read-only shape of the optional inline `Source`
 * (`PublicOrderDto`) returned by the receivables API.
 * Enum values reference the `orders` feature contracts (`import type` only).
 */
export interface ReceivableSource extends FinancialObligationSourceRef {
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

export interface Receivable extends FinancialObligation {
  /**
   * Wire name `partyId`.
   * Currently always references a customer (`/customers/:partyId`).
   */
  partyId: string;
  /**
   * Wire name `sourceId`.
   * Currently always references an order (`/orders/:sourceId`).
   */
  sourceId: string;
  /** Optional inline party (`CustomerDto`) with the display name. */
  party?: ReceivablePartyRef | null;
  /** Optional inline source order (`PublicOrderDto`) with the full order summary. */
  source?: ReceivableSource | null;
  settlements: ReceivableSettlement[];
}

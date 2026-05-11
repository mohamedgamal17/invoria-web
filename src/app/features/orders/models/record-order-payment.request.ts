import type { OrderPaymentMethod } from './order-payment.enums';

/**
 * Body for POST /orders/{id}/payments (Swagger).
 */
export interface RecordOrderPaymentRequest {
  PaidAmount: number;
  PaymentMethod: OrderPaymentMethod;
  PaidAt?: string | null;
}

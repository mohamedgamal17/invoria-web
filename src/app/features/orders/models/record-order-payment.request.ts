import type { FormControl, FormGroup } from '@angular/forms';

import type { OrderPaymentMethod } from './order-payment.enums';

/**
 * Body for POST /orders/{id}/payments (Swagger).
 */
export interface RecordOrderPaymentRequest {
  PaidAmount: number;
  PaymentMethod: OrderPaymentMethod;
  PaidAt?: string | null;
}

/**
 * Typed reactive form backing the record-payment dialog.
 */
export type RecordOrderPaymentForm = FormGroup<{
  paidAmount: FormControl<number | null>;
  paymentMethod: FormControl<OrderPaymentMethod>;
}>;

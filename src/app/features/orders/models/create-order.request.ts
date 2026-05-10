import type { CreateOrderLineItemRequest } from './create-order-line-item.request';
import type { PaymentType } from './order-payment.enums';

/**
 * Body for POST /orders (Swagger).
 */
export interface CreateOrderRequest {
  CustomerId: string;
  Items: CreateOrderLineItemRequest[];
  /** `InvoriaOrderingContractsOrdersOrderPaymentType`; omit for server default. */
  PaymentType?: PaymentType | null;
}

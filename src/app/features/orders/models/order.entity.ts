import { Entity } from '../../../core/models/entity';
import type { Customer } from '../../customers/models/customer.entity';
import type { Product } from '../../products/models/product.entity';
import type { OrderPaymentMethod, PaymentStatus, PaymentType } from './order-payment.enums';

/** `InvoriaOrderingContractsOrdersOrderStatus` (Swagger: integer enum). */
export enum OrderStatus {
  Pending = 5,
  Accepted = 10,
  Completed = 15,
  Cancelled = 20,
  Reopened = 25,
  Refused = 30
}

/** `InvoriaOrderingContractsOrdersFullfillmentStatus` (Swagger spelling). */
export enum OrderFullfillmentStatus {
  Pending = 5,
  Allocating = 10,
  Allocated = 15,
  OnHold = 20,
  Releasing = 25,
  Dispatched = 30,
  Cancelled = 35
}

/** `InvoriaOrderingContractsDtosOrderItemDto` (GET/POST order responses). */
export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
  product?: Product | null;
}

/** `InvoriaOrderingContractsDtosOrderFailureDetailsDto` (GET/POST order responses). */
export interface OrderFailureDetails extends Entity {
  itemId: string;
  itemName?: string | null;
  quantityRequested: number;
  quantityAvailable: number;
  shortage: number;
}

/** `InvoriaOrderingContractsDtosOrderStateTransitionHistoryDto` (GET/POST order responses). */
export interface OrderStateTransitionHistory {
  fromStatus: OrderStatus;
  toStatus: OrderStatus;
  fromFullfillmentStatus: OrderFullfillmentStatus;
  toFullfillmentStatus: OrderFullfillmentStatus;
  changedAt: string;
  reason?: string | null;
}

/** `InvoriaOrderingContractsDtosOrderPaymentDto` (GET/POST order responses). */
export interface OrderPayment extends Entity {
  orderId: string;
  paidAmount: number;
  paymentMethod: OrderPaymentMethod;
  paidAt: string;
}

/** `InvoriaOrderingContractsDtosOrderDto` (Swagger-aligned; JSON uses camelCase). */
export interface Order extends Entity {
  orderNumber: string;
  customerId: string;
  customer?: Customer | null;
  status: OrderStatus;
  /** API contract spelling (`FullfillmentStatus` in OpenAPI). */
  fullfillmentStatus: OrderFullfillmentStatus;
  paymentType?: PaymentType;
  paymentStatus?: PaymentStatus;
  amountPaid?: number;
  amountOutstanding?: number;
  /** Omitted or empty when list is fetched with `IncludeOrderItems: false`. */
  items?: OrderItem[];
  /** Present when order operations fail (e.g. allocation shortage). */
  failureDetails?: OrderFailureDetails[];
  /** Server-side state transition history. */
  stateTransitionHistory?: OrderStateTransitionHistory[];
  payments?: OrderPayment[];
}

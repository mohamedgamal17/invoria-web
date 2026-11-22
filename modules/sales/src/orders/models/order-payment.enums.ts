/**
 * `InvoriaOrderingContractsOrdersOrderPaymentStatus` (Swagger: integer enum).
 */
export enum PaymentStatus {
  Unpaid = 0,
  Partial = 1,
  Paid = 2
}

/**
 * `InvoriaOrderingContractsOrdersOrderPaymentType` (Swagger: integer enum).
 */
export enum PaymentType {
  Immediate = 0,
  Debt = 1
}

/**
 * `InvoriaOrderingContractsOrdersOrderPaymentMethod` (per payment row in `Payments`).
 */
export enum OrderPaymentMethod {
  Cash = 0,
  BankTransfer = 1,
  Cheque = 2,
  Other = 3
}

export function paymentStatusLabel(status: PaymentStatus): string {
  switch (status) {
    case PaymentStatus.Unpaid:
      return 'Unpaid';
    case PaymentStatus.Partial:
      return 'Partial';
    case PaymentStatus.Paid:
      return 'Paid';
    default:
      return 'Unknown';
  }
}

export function paymentTypeLabel(type: PaymentType): string {
  switch (type) {
    case PaymentType.Immediate:
      return 'Immediate';
    case PaymentType.Debt:
      return 'Debt';
    default:
      return 'Unknown';
  }
}

export function paymentMethodLabel(method: OrderPaymentMethod): string {
  switch (method) {
    case OrderPaymentMethod.Cash:
      return 'Cash';
    case OrderPaymentMethod.BankTransfer:
      return 'Bank transfer';
    case OrderPaymentMethod.Cheque:
      return 'Cheque';
    case OrderPaymentMethod.Other:
      return 'Other';
    default:
      return 'Unknown';
  }
}

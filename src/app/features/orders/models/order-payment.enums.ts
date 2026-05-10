/**
 * Payment-related enums for order list filters (GET `/orders` query).
 * Reconcile numeric values with OpenAPI when published (`x-enumNames` / `enum`).
 */
export enum PaymentStatus {
  Pending = 5,
  Paid = 10,
  PartiallyPaid = 15,
  Refunded = 20,
  Failed = 25
}

export enum PaymentType {
  Unspecified = 5,
  Cash = 10,
  Card = 15,
  BankTransfer = 20,
  Wallet = 25
}

export function paymentStatusLabel(status: PaymentStatus): string {
  switch (status) {
    case PaymentStatus.Pending:
      return 'Pending';
    case PaymentStatus.Paid:
      return 'Paid';
    case PaymentStatus.PartiallyPaid:
      return 'Partially paid';
    case PaymentStatus.Refunded:
      return 'Refunded';
    case PaymentStatus.Failed:
      return 'Failed';
    default:
      return 'Unknown';
  }
}

export function paymentTypeLabel(type: PaymentType): string {
  switch (type) {
    case PaymentType.Unspecified:
      return 'Unspecified';
    case PaymentType.Cash:
      return 'Cash';
    case PaymentType.Card:
      return 'Card';
    case PaymentType.BankTransfer:
      return 'Bank transfer';
    case PaymentType.Wallet:
      return 'Wallet';
    default:
      return 'Unknown';
  }
}

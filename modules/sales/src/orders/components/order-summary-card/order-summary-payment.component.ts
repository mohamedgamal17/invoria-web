import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TagModule } from 'primeng/tag';

import { DEFAULT_CURRENCY_CODE } from '@invoria/utils';

import {
  PaymentStatus,
  PaymentType,
  paymentStatusLabel,
  paymentTypeLabel,
} from '@invoria/sales/orders/models/order-payment.enums';
import type { UiOrder } from '@invoria/sales/orders/models/order-ui.model';

@Component({
  selector: 'app-order-summary-payment',
  standalone: true,
  imports: [CommonModule, TagModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './order-summary-payment.component.html',
})
export class OrderSummaryPaymentComponent {
  readonly order = input.required<UiOrder>();
  readonly currencyCode = input<string>(DEFAULT_CURRENCY_CODE);

  readonly Math = Math;

  paymentTypeDisplay(type: PaymentType | undefined): string {
    return type !== undefined ? paymentTypeLabel(type) : '—';
  }

  paymentStatusDisplay(status: PaymentStatus | undefined): string {
    return status !== undefined ? paymentStatusLabel(status) : '—';
  }

  readonly paidPercent = computed(() => {
    const order = this.order();
    if (
      order.amountPaid == null ||
      !Number.isFinite(order.netOfTotalOrderAmount) ||
      order.netOfTotalOrderAmount <= 0
    ) {
      return null;
    }
    return (order.amountPaid / order.netOfTotalOrderAmount) * 100;
  });

  getPaymentStatusSeverity(
    status: PaymentStatus | undefined,
  ): 'success' | 'secondary' | 'info' | 'warn' | 'danger' {
    if (status === undefined) return 'secondary';
    switch (status) {
      case PaymentStatus.Paid:
        return 'success';
      case PaymentStatus.Partial:
        return 'warn';
      case PaymentStatus.Unpaid:
      default:
        return 'secondary';
    }
  }

  getPaymentTypeSeverity(
    type: PaymentType | undefined,
  ): 'success' | 'secondary' | 'info' | 'warn' | 'danger' {
    if (type === undefined) return 'secondary';
    switch (type) {
      case PaymentType.Immediate:
        return 'info';
      case PaymentType.Debt:
        return 'warn';
      default:
        return 'secondary';
    }
  }
}

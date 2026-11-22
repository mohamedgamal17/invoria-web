import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

import { DEFAULT_CURRENCY_CODE } from '@invoria/utils';

import {
  PaymentStatus,
  PaymentType,
  paymentMethodLabel,
  paymentStatusLabel,
  paymentTypeLabel
} from '@invoria/sales/orders/models/order-payment.enums';
import type { UiOrder } from '@invoria/sales/orders/models/order-ui.model';

@Component({
  selector: 'app-order-details-payment-tab',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    TableModule,
    TagModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './order-details-payment-tab.component.html'
})
export class OrderDetailsPaymentTabComponent {
  readonly order = input.required<UiOrder>();
  readonly currencyCode = input<string>(DEFAULT_CURRENCY_CODE);

  readonly paymentMethodLabel = paymentMethodLabel;

  readonly Math = Math;

  /** True when paid + outstanding matches total within a small tolerance. */
  readonly paidPercent = computed(() => {
    const order = this.order();
    if (order.amountPaid == null || !Number.isFinite(order.netOfTotalOrderAmount) || order.netOfTotalOrderAmount <= 0) return null;
    return (order.amountPaid / order.netOfTotalOrderAmount) * 100;
  });

  readonly paymentFiguresAligned = computed(() => {
    const order = this.order();
    if (order.amountPaid == null || order.amountOutstanding == null) {
      return true;
    }
    return Math.abs(
      order.amountPaid + order.amountOutstanding - order.netOfTotalOrderAmount
    ) <= 0.02;
  });

  paymentTypeDisplay(type: PaymentType | undefined): string {
    return type !== undefined ? paymentTypeLabel(type) : '—';
  }

  paymentStatusDisplay(status: PaymentStatus | undefined): string {
    return status !== undefined ? paymentStatusLabel(status) : '—';
  }

  getPaymentStatusSeverity(
    status: PaymentStatus | undefined
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

  getPaymentTypeSeverity(status: PaymentType | undefined): 'success' | 'secondary' | 'info' | 'warn' | 'danger' {
    if (status === undefined) return 'secondary';
    switch (status) {
      case PaymentType.Immediate:
        return 'info';
      case PaymentType.Debt:
        return 'warn';
      default:
        return 'secondary';
    }
  }
}

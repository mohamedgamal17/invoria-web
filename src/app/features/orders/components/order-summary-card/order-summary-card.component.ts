import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';

import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';

import { PaymentStatus, PaymentType, paymentStatusLabel, paymentTypeLabel } from '../../models/order-payment.enums';
import { orderStatusEmoji, orderStatusUserLabel, orderStatusSeverity } from '../../models/order-actions';
import { OrderStatus } from '../../models/order.entity';
import type { UiOrder } from '../../models/order-ui.model';

const PAYMENT_SUMMARY_EPS = 0.02;

@Component({
  selector: 'app-order-summary-card',
  standalone: true,
  imports: [CommonModule, CardModule, TagModule],
  templateUrl: './order-summary-card.component.html'
})
export class OrderSummaryCardComponent {
  readonly order = input.required<UiOrder>();
  readonly currencyCode = input<string>('EGP');

  readonly orderStatusEmoji = orderStatusEmoji;
  readonly orderStatusUserLabel = orderStatusUserLabel;
  readonly orderStatusSeverity = orderStatusSeverity;

  readonly progressPercent = computed(() => {
    switch (this.order().status) {
      case OrderStatus.Pending: return 25;
      case OrderStatus.Processing: return 50;
      case OrderStatus.Revision: return 50;
      case OrderStatus.Completed: return 100;
      case OrderStatus.Cancelled: return 100;
      case OrderStatus.RevisionPending: return 50;
      default: return 0;
    }
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

  getPaymentTypeSeverity(type: PaymentType | undefined): 'success' | 'secondary' | 'info' | 'warn' | 'danger' {
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

  paidPercentOfTotal(order: UiOrder): number | null {
    if (
      order.amountPaid === undefined ||
      order.amountPaid === null ||
      !Number.isFinite(order.totalAmount) ||
      order.totalAmount <= 0
    ) {
      return null;
    }
    return (order.amountPaid / order.totalAmount) * 100;
  }

  paymentTotalsAligned(order: UiOrder): boolean {
    if (order.amountPaid == null || order.amountOutstanding == null) {
      return true;
    }
    return Math.abs(order.amountPaid + order.amountOutstanding - order.totalAmount) <= PAYMENT_SUMMARY_EPS;
  }
}

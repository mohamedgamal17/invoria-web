import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { TagModule } from 'primeng/tag';

import { PaymentStatus, PaymentType, paymentStatusLabel, paymentTypeLabel } from '../../models/order-payment.enums';
import type { UiOrder } from '../../models/order-ui.model';

@Component({
  selector: 'app-order-summary-payment',
  standalone: true,
  imports: [CommonModule, TagModule],
  template: `
    <div class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">Payment</div>

    <div class="flex flex-wrap items-center gap-2 mb-3">
      <p-tag
        [value]="paymentTypeDisplay(order().paymentType)"
        [severity]="getPaymentTypeSeverity(order().paymentType)"
        styleClass="px-2 py-0.5 text-[10px] uppercase font-bold tracking-tight rounded-md"
      />
      <p-tag
        [value]="paymentStatusDisplay(order().paymentStatus)"
        [severity]="getPaymentStatusSeverity(order().paymentStatus)"
        styleClass="px-2 py-0.5 text-[10px] uppercase font-bold tracking-tight rounded-md"
      />
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div class="rounded-lg border border-border/60 bg-muted/20 p-3 space-y-1">
        <div class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Amount Paid</div>
        <div class="text-lg font-bold tabular-nums text-success">
          {{ order().amountPaid ?? 0 | currency: currencyCode() : 'symbol-narrow' }}
        </div>
      </div>
      <div class="rounded-lg border border-border/60 bg-muted/20 p-3 space-y-1">
        <div class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Outstanding</div>
        <div class="text-lg font-bold tabular-nums" [class.text-warn]="(order().amountOutstanding ?? 0) > 0" [class.text-muted-foreground]="!order().amountOutstanding">
          {{ order().amountOutstanding ?? 0 | currency: currencyCode() : 'symbol-narrow' }}
        </div>
      </div>
    </div>

    @if (paidPercent() !== null) {
      <div class="mt-3">
        <div class="flex justify-between text-xs text-muted-foreground mb-1">
          <span>Payment progress</span>
          <span>{{ paidPercent()!.toFixed(0) }}%</span>
        </div>
        <div class="h-2 bg-border/40 rounded-full overflow-hidden">
          <div
            class="h-full rounded-full transition-all duration-500"
            [class.bg-success]="paidPercent()! < 100"
            [class.bg-primary]="paidPercent()! >= 100"
            [style.width.%]="Math.min(paidPercent()!, 100)"
          ></div>
        </div>
      </div>
    }
  `
})
export class OrderSummaryPaymentComponent {
  readonly order = input.required<UiOrder>();
  readonly currencyCode = input<string>('EGP');

  readonly Math = Math;

  paymentTypeDisplay(type: PaymentType | undefined): string {
    return type !== undefined ? paymentTypeLabel(type) : '—';
  }

  paymentStatusDisplay(status: PaymentStatus | undefined): string {
    return status !== undefined ? paymentStatusLabel(status) : '—';
  }

  readonly paidPercent = computed(() => {
    const order = this.order();
    if (order.amountPaid == null || !Number.isFinite(order.totalAmount) || order.totalAmount <= 0) {
      return null;
    }
    return (order.amountPaid / order.totalAmount) * 100;
  });

  getPaymentStatusSeverity(status: PaymentStatus | undefined): 'success' | 'secondary' | 'info' | 'warn' | 'danger' {
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
}

import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, model, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize, take } from 'rxjs';

import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

import { presentApiError } from '../../../../core/http/api-error.presenter';
import {
  OrderPaymentMethod,
  PaymentStatus,
  PaymentType,
  paymentMethodLabel,
  paymentStatusLabel,
  paymentTypeLabel
} from '../../models/order-payment.enums';
import { OrderStatus } from '../../models/order.entity';
import type { UiOrder } from '../../models/order-ui.model';
import { OrdersApiService } from '../../services/orders-api.service';



const MONEY_EPS = 0.005;

@Component({
  selector: 'app-order-details-payment-tab',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    CardModule,
    DialogModule,
    InputNumberModule,
    SelectModule,
    TableModule,
    TagModule
  ],
  templateUrl: './order-details-payment-tab.component.html'
})
export class OrderDetailsPaymentTabComponent {
  readonly order = input.required<UiOrder>();
  readonly currencyCode = input<string>('EGP');
  readonly recordingDisabled = input(false);

  readonly refreshRequested = output<void>();

  readonly paymentMethodLabel = paymentMethodLabel;

  /** Record payment only after the order is completed and payment type is known. */
  readonly canRecordPayment = computed(() => {
    const o = this.order();
    return o.status === OrderStatus.Completed && o.paymentType !== undefined && o.paymentType !== null;
  });

  readonly isImmediatePayment = computed(() => this.order().paymentType === PaymentType.Immediate);

  readonly isDebtPayment = computed(() => this.order().paymentType === PaymentType.Debt);

  /**
   * Debt: if outstanding &gt; 0, cap is outstanding; if outstanding is 0, cap is order total.
   * Immediate: cap is order total (amount is fixed to total).
   */
  readonly recordPaidAmountMax = computed((): number => {
    const o = this.order();
    if (o.paymentType === PaymentType.Immediate) {
      return o.totalAmount;
    }
    if (o.paymentType === PaymentType.Debt) {
      const outstanding = o.amountOutstanding ?? 0;
      if (outstanding > MONEY_EPS) {
        return outstanding;
      }
      return o.totalAmount;
    }
    return o.totalAmount;
  });

  readonly recordPaidAmountMin = computed((): number => {
    if (this.order().paymentType === PaymentType.Debt) {
      return 0.01;
    }
    return this.order().totalAmount;
  });

  /** True when paid + outstanding matches total within a small tolerance. */
  readonly paymentFiguresAligned = computed(() => {
    const o = this.order();
    if (o.amountPaid == null || o.amountOutstanding == null) {
      return true;
    }
    return Math.abs(o.amountPaid + o.amountOutstanding - o.totalAmount) <= 0.02;
  });

  private readonly ordersApi = inject(OrdersApiService);
  private readonly messageService = inject(MessageService);

  readonly dialogVisible = model(false);
  readonly paymentSaving = signal(false);

  /** Dialog form state (avoid mixing signals with PrimeNG ngModel quirks). */
  recordPaidAmount: number | null = null;
  recordPaymentMethod = OrderPaymentMethod.Cash;

  readonly paymentMethodOptions = [
    { label: paymentMethodLabel(OrderPaymentMethod.Cash), value: OrderPaymentMethod.Cash },
    { label: paymentMethodLabel(OrderPaymentMethod.BankTransfer), value: OrderPaymentMethod.BankTransfer },
    { label: paymentMethodLabel(OrderPaymentMethod.Cheque), value: OrderPaymentMethod.Cheque },
    { label: paymentMethodLabel(OrderPaymentMethod.Other), value: OrderPaymentMethod.Other }
  ];

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

  openRecordDialog(): void {
    const o = this.order();
    if (o.paymentType === PaymentType.Immediate) {
      this.recordPaidAmount = o.totalAmount;
    } else if (o.paymentType === PaymentType.Debt) {
      const outstanding = o.amountOutstanding ?? 0;
      if (outstanding > MONEY_EPS) {
        this.recordPaidAmount = outstanding;
      } else {
        this.recordPaidAmount = null;
      }
    } else {
      this.recordPaidAmount = null;
    }
    this.recordPaymentMethod = OrderPaymentMethod.Cash;
    this.dialogVisible.set(true);
  }

  closeDialog(): void {
    this.dialogVisible.set(false);
  }

  submitPayment(): void {
    const o = this.order();
    const id = o.id;
    const amount = this.recordPaidAmount;

    if (o.paymentType === PaymentType.Immediate) {
      const expected = o.totalAmount;
      if (
        amount === null ||
        !Number.isFinite(amount) ||
        Math.abs(amount - expected) > MONEY_EPS
      ) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Validation',
          detail: 'Immediate payment must equal the full order total.'
        });
        return;
      }
    } else if (o.paymentType === PaymentType.Debt) {
      const max = this.recordPaidAmountMax();
      const min = this.recordPaidAmountMin();
      if (amount === null || !Number.isFinite(amount)) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Validation',
          detail: 'Enter a valid payment amount.'
        });
        return;
      }
      if (amount < min - MONEY_EPS || amount > max + MONEY_EPS) {
        const outstanding = o.amountOutstanding ?? 0;
        const capIsTotal = outstanding <= MONEY_EPS;
        this.messageService.add({
          severity: 'warn',
          summary: 'Validation',
          detail: capIsTotal
            ? `Amount must be between ${min.toFixed(2)} and ${max.toFixed(2)} (order total).`
            : `Amount must be between ${min.toFixed(2)} and ${max.toFixed(2)} (outstanding balance).`
        });
        return;
      }
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation',
        detail: 'Payment type is not set for this order.'
      });
      return;
    }

    this.paymentSaving.set(true);
    this.ordersApi
      .recordOrderPayment(id, {
        PaidAmount: amount,
        PaymentMethod: this.recordPaymentMethod,
        PaidAt: null
      })
      .pipe(
        take(1),
        finalize(() => this.paymentSaving.set(false))
      )
      .subscribe({
        next: (res) => {
          if (!res.isSuccess || !res.result) {
            this.messageService.add(presentApiError(res.error).toast);
            return;
          }
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Payment recorded successfully.'
          });
          this.dialogVisible.set(false);
          this.refreshRequested.emit();
        },
        error: (err: unknown) => {
          this.messageService.add(presentApiError(err).toast);
        }
      });
  }
}

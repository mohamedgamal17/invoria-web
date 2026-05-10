import { CommonModule } from '@angular/common';
import { Component, DestroyRef, effect, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';

import { SurfaceCardComponent } from '../../../../shared/ui/surface-card/surface-card.component';
import { orderStatusLabel } from '../../models/order-actions';
import { OrderStatus } from '../../models/order.entity';
import {
  PaymentStatus,
  PaymentType,
  paymentStatusLabel,
  paymentTypeLabel
} from '../../models/order-payment.enums';

export type OrdersListFilters = {
  orderNumber: string;
  status: number | null;
  paymentStatus: number | null;
  paymentType: number | null;
};

type FilterOption = { label: string; value: number | null };

function numericEnumValues<T extends Record<string, string | number>>(e: T): number[] {
  return Object.values(e).filter((v): v is number => typeof v === 'number');
}

const ORDER_NUMBER_FILTER_DEBOUNCE_MS = 700;

@Component({
  selector: 'app-orders-filter-panel',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    SelectModule,
    SurfaceCardComponent
  ],
  templateUrl: './orders-filter-panel.component.html'
})
export class OrdersFilterPanelComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly orderNumberInput$ = new Subject<string>();

  orderNumber = input<string>('');
  status = input<number | null>(null);
  paymentStatus = input<number | null>(null);
  paymentType = input<number | null>(null);
  loading = input(false);

  /** Draft order number for the text field; synced from `orderNumber` when the parent input changes. */
  readonly localOrderNumber = signal('');

  filtersChange = output<OrdersListFilters>();
  clearFilters = output<void>();

  constructor() {
    effect(() => {
      this.localOrderNumber.set(this.orderNumber());
    });

    this.orderNumberInput$
      .pipe(
        debounceTime(ORDER_NUMBER_FILTER_DEBOUNCE_MS),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((value) => {
        this.emitFilters({ orderNumber: value });
      });
  }

  readonly statusOptions: FilterOption[] = [
    { label: 'All statuses', value: null },
    ...numericEnumValues(OrderStatus).map((v) => ({
      label: orderStatusLabel(v),
      value: v
    }))
  ];

  readonly paymentStatusOptions: FilterOption[] = [
    { label: 'All payment statuses', value: null },
    ...numericEnumValues(PaymentStatus).map((v) => ({
      label: paymentStatusLabel(v),
      value: v
    }))
  ];

  readonly paymentTypeOptions: FilterOption[] = [
    { label: 'All payment types', value: null },
    ...numericEnumValues(PaymentType).map((v) => ({
      label: paymentTypeLabel(v),
      value: v
    }))
  ];

  onOrderNumberInput(value: string): void {
    this.localOrderNumber.set(value);
    this.orderNumberInput$.next(value);
  }

  onStatusChange(value: number | null | undefined): void {
    this.emitFilters({ status: value ?? null });
  }

  onPaymentStatusChange(value: number | null | undefined): void {
    this.emitFilters({ paymentStatus: value ?? null });
  }

  onPaymentTypeChange(value: number | null | undefined): void {
    this.emitFilters({ paymentType: value ?? null });
  }

  onClear(): void {
    this.clearFilters.emit();
  }

  private emitFilters(patch: Partial<OrdersListFilters>): void {
    this.filtersChange.emit({
      orderNumber: patch.orderNumber ?? this.localOrderNumber(),
      status: patch.status !== undefined ? patch.status : this.status(),
      paymentStatus:
        patch.paymentStatus !== undefined ? patch.paymentStatus : this.paymentStatus(),
      paymentType: patch.paymentType !== undefined ? patch.paymentType : this.paymentType()
    });
  }
}

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

import { SEARCH_DEBOUNCE_MS } from '../../../../shared/models/debounce';
import { SurfaceCardComponent } from '../../../../shared/ui/surface-card/surface-card.component';
import { getOrderStatusLabel } from '../../models/order-actions';
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

function numericEnumValues<T extends Record<string, string | number>>(enumMap: T): number[] {
  return Object.values(enumMap).filter((value): value is number => typeof value === 'number');
}

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
        debounceTime(SEARCH_DEBOUNCE_MS),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((value) => {
        this.emitFilters({ orderNumber: value });
      });
  }

  readonly statusOptions: FilterOption[] = [
    { label: 'All statuses', value: null },
    ...numericEnumValues(OrderStatus).map((value) => ({
      label: getOrderStatusLabel(value),
      value: value
    }))
  ];

  readonly paymentStatusOptions: FilterOption[] = [
    { label: 'All payment statuses', value: null },
    ...numericEnumValues(PaymentStatus).map((value) => ({
      label: paymentStatusLabel(value),
      value: value
    }))
  ];

  readonly paymentTypeOptions: FilterOption[] = [
    { label: 'All payment types', value: null },
    ...numericEnumValues(PaymentType).map((value) => ({
      label: paymentTypeLabel(value),
      value: value
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

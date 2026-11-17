import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';

import type { SelectOption } from '../../../../shared/models/select-option';
import { SurfaceCardComponent } from '../../../../shared/ui/surface-card/surface-card.component';
import { createDebouncedInput } from '../../../../shared/utils/debounce-input';
import { numericEnumValues } from '../../../../shared/utils/numeric-enum-values';
import { buildSelectOptions } from '../../../../shared/utils/select-options';
import { getOrderStatusLabel } from '../../models/order-actions';
import { OrderStatus } from '../../models/order.entity';
import {
  PaymentStatus,
  PaymentType,
  paymentStatusLabel,
  paymentTypeLabel,
} from '../../models/order-payment.enums';
import type { OrdersListFilters } from '../../models/orders-list.filters';

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
    SurfaceCardComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './orders-filter-panel.component.html',
})
export class OrdersFilterPanelComponent {
  orderNumber = input<string>('');
  status = input<number | null>(null);
  paymentStatus = input<number | null>(null);
  paymentType = input<number | null>(null);
  loading = input(false);

  filtersChange = output<OrdersListFilters>();
  clearFilters = output<void>();

  private readonly debouncedOrderNumber = createDebouncedInput(this.orderNumber, (value) =>
    this.emitFilters({ orderNumber: value }),
  );

  readonly localOrderNumber = this.debouncedOrderNumber.value;

  readonly statusOptions: SelectOption<number | null>[] = buildSelectOptions(
    numericEnumValues(OrderStatus),
    getOrderStatusLabel,
    { label: 'All statuses', value: null },
  );

  readonly paymentStatusOptions: SelectOption<number | null>[] = buildSelectOptions(
    numericEnumValues(PaymentStatus),
    paymentStatusLabel,
    { label: 'All payment statuses', value: null },
  );

  readonly paymentTypeOptions: SelectOption<number | null>[] = buildSelectOptions(
    numericEnumValues(PaymentType),
    paymentTypeLabel,
    { label: 'All payment types', value: null },
  );

  onOrderNumberInput(value: string): void {
    this.debouncedOrderNumber.set(value);
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
      paymentStatus: patch.paymentStatus !== undefined ? patch.paymentStatus : this.paymentStatus(),
      paymentType: patch.paymentType !== undefined ? patch.paymentType : this.paymentType(),
    });
  }
}

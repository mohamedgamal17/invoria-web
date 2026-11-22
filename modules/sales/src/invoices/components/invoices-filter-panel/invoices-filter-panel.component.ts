import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';

import { createDebouncedInput } from '@invoria/utils';
import { SurfaceCardComponent } from '@invoria/ui';
import type { InvoicesListFilters } from '@invoria/sales/invoices/models/invoices-list.filters';

@Component({
  selector: 'app-invoices-filter-panel',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    SurfaceCardComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './invoices-filter-panel.component.html',
})
export class InvoicesFilterPanelComponent {
  customerId = input<string>('');
  orderId = input<string>('');
  loading = input(false);

  filtersChange = output<InvoicesListFilters>();
  clearFilters = output<void>();

  private readonly debouncedCustomerId = createDebouncedInput(this.customerId, (value) =>
    this.emitFilters({ customerId: value }),
  );

  private readonly debouncedOrderId = createDebouncedInput(this.orderId, (value) =>
    this.emitFilters({ orderId: value }),
  );

  readonly localCustomerId = this.debouncedCustomerId.value;
  readonly localOrderId = this.debouncedOrderId.value;

  onCustomerIdInput(value: string): void {
    this.debouncedCustomerId.set(value);
  }

  onOrderIdInput(value: string): void {
    this.debouncedOrderId.set(value);
  }

  onClear(): void {
    this.clearFilters.emit();
  }

  private emitFilters(patch: Partial<InvoicesListFilters>): void {
    this.filtersChange.emit({
      customerId: patch.customerId !== undefined ? patch.customerId : this.localCustomerId(),
      orderId: patch.orderId !== undefined ? patch.orderId : this.localOrderId(),
    });
  }
}

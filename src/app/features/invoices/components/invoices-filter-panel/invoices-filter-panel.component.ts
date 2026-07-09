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

import { SurfaceCardComponent } from '../../../../shared/ui/surface-card/surface-card.component';

export type InvoicesListFilters = {
  customerId: string;
  orderId: string;
};

const INVOICE_FILTER_DEBOUNCE_MS = 700;

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
    SurfaceCardComponent
  ],
  templateUrl: './invoices-filter-panel.component.html'
})
export class InvoicesFilterPanelComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly customerIdInput$ = new Subject<string>();
  private readonly orderIdInput$ = new Subject<string>();

  customerId = input<string>('');
  orderId = input<string>('');
  loading = input(false);

  readonly localCustomerId = signal('');
  readonly localOrderId = signal('');

  filtersChange = output<InvoicesListFilters>();
  clearFilters = output<void>();

  constructor() {
    effect(() => {
      this.localCustomerId.set(this.customerId());
    });

    effect(() => {
      this.localOrderId.set(this.orderId());
    });

    this.customerIdInput$
      .pipe(
        debounceTime(INVOICE_FILTER_DEBOUNCE_MS),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((value) => {
        this.emitFilters({ customerId: value });
      });

    this.orderIdInput$
      .pipe(
        debounceTime(INVOICE_FILTER_DEBOUNCE_MS),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((value) => {
        this.emitFilters({ orderId: value });
      });
  }

  onCustomerIdInput(value: string): void {
    this.localCustomerId.set(value);
    this.customerIdInput$.next(value);
  }

  onOrderIdInput(value: string): void {
    this.localOrderId.set(value);
    this.orderIdInput$.next(value);
  }

  onClear(): void {
    this.clearFilters.emit();
  }

  private emitFilters(patch: Partial<InvoicesListFilters>): void {
    this.filtersChange.emit({
      customerId: patch.customerId !== undefined ? patch.customerId : this.localCustomerId(),
      orderId: patch.orderId !== undefined ? patch.orderId : this.localOrderId()
    });
  }
}

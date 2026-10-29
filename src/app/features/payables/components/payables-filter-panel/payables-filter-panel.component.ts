import { CommonModule } from '@angular/common';
import { Component, DestroyRef, computed, effect, inject, input, output, signal } from '@angular/core';
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

export type PayablesListFilters = {
  supplierId: string;
  sourceId: string;
  isPaid: boolean | null;
};

type PaidFilterOption = { label: string; value: boolean | null };
type SupplierFilterOption = { label: string; value: string };

const PAYABLE_FILTER_DEBOUNCE_MS = 700;

@Component({
  selector: 'app-payables-filter-panel',
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
  templateUrl: './payables-filter-panel.component.html'
})
export class PayablesFilterPanelComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly sourceIdInput$ = new Subject<string>();

  /** Supplier options (id -> name) loaded once by the smart page. */
  suppliers = input<{ id: string; name: string }[]>([]);
  supplierId = input<string>('');
  sourceId = input<string>('');
  isPaid = input<boolean | null>(null);
  loading = input(false);

  readonly localSupplierId = signal('');
  readonly localSourceId = signal('');

  readonly supplierOptions = computed<SupplierFilterOption[]>(() =>
    this.suppliers().map((s) => ({ label: s.name, value: s.id }))
  );

  filtersChange = output<PayablesListFilters>();
  clearFilters = output<void>();

  readonly isPaidOptions: PaidFilterOption[] = [
    { label: 'All', value: null },
    { label: 'Paid', value: true },
    { label: 'Unpaid', value: false }
  ];

  constructor() {
    effect(() => {
      this.localSupplierId.set(this.supplierId());
    });

    effect(() => {
      this.localSourceId.set(this.sourceId());
    });

    this.sourceIdInput$
      .pipe(
        debounceTime(PAYABLE_FILTER_DEBOUNCE_MS),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((value) => {
        this.emitFilters({ sourceId: value });
      });
  }

  onSupplierIdChange(value: string | null | undefined): void {
    this.localSupplierId.set(value ?? '');
    this.emitFilters({ supplierId: value ?? '' });
  }

  onSourceIdInput(value: string): void {
    this.localSourceId.set(value);
    this.sourceIdInput$.next(value);
  }

  onIsPaidChange(value: boolean | null | undefined): void {
    this.emitFilters({ isPaid: value ?? null });
  }

  onClear(): void {
    this.clearFilters.emit();
  }

  private emitFilters(patch: Partial<PayablesListFilters>): void {
    this.filtersChange.emit({
      supplierId: patch.supplierId !== undefined ? patch.supplierId : this.localSupplierId(),
      sourceId: patch.sourceId !== undefined ? patch.sourceId : this.localSourceId(),
      isPaid: patch.isPaid !== undefined ? patch.isPaid : this.isPaid()
    });
  }
}

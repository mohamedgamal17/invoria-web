import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';

import { createDebouncedInput } from '@invoria/utils';
import type { SelectOption } from '@invoria/utils';
import { SurfaceCardComponent } from '@invoria/ui';
import type { PayablesListFilters, SupplierRef } from '@invoria/financial/payables/models/payables-list.filters';

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
    SurfaceCardComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './payables-filter-panel.component.html',
})
export class PayablesFilterPanelComponent {
  /** Supplier options (id -> name) loaded once by the smart page. */
  suppliers = input<SupplierRef[]>([]);
  supplierId = input<string>('');
  sourceId = input<string>('');
  isPaid = input<boolean | null>(null);
  loading = input(false);

  readonly localSupplierId = signal('');

  readonly supplierOptions = computed<SelectOption<string>[]>(() =>
    this.suppliers().map((supplier) => ({ label: supplier.name, value: supplier.id })),
  );

  filtersChange = output<PayablesListFilters>();
  clearFilters = output<void>();

  readonly isPaidOptions: SelectOption<boolean | null>[] = [
    { label: 'All', value: null },
    { label: 'Paid', value: true },
    { label: 'Unpaid', value: false },
  ];

  private readonly debouncedSourceId = createDebouncedInput(this.sourceId, (value) =>
    this.emitFilters({ sourceId: value }),
  );

  readonly localSourceId = this.debouncedSourceId.value;

  constructor() {
    effect(() => {
      this.localSupplierId.set(this.supplierId());
    });
  }

  onSupplierIdChange(value: string | null | undefined): void {
    this.localSupplierId.set(value ?? '');
    this.emitFilters({ supplierId: value ?? '' });
  }

  onSourceIdInput(value: string): void {
    this.debouncedSourceId.set(value);
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
      isPaid: patch.isPaid !== undefined ? patch.isPaid : this.isPaid(),
    });
  }
}

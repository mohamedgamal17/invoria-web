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
import { PurchaseState } from '../../enums/purchase-state.enum';
import { purchaseStateLabel } from '../../models/purchase-state.display';

export type PurchaseOrdersListFilters = {
  purchaseNumber: string;
  status: number | null;
};

type FilterOption = { label: string; value: number | null };

function numericEnumValues<T extends Record<string, string | number>>(e: T): number[] {
  return Object.values(e).filter((v): v is number => typeof v === 'number');
}

const PURCHASE_NUMBER_FILTER_DEBOUNCE_MS = 700;

@Component({
  selector: 'app-purchase-orders-filter-panel',
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
  templateUrl: './purchase-orders-filter-panel.component.html'
})
export class PurchaseOrdersFilterPanelComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly purchaseNumberInput$ = new Subject<string>();

  purchaseNumber = input<string>('');
  status = input<number | null>(null);
  loading = input(false);

  /** Draft PO number for the text field; synced from `purchaseNumber` when the parent input changes. */
  readonly localPurchaseNumber = signal('');

  filtersChange = output<PurchaseOrdersListFilters>();
  clearFilters = output<void>();

  constructor() {
    effect(() => {
      this.localPurchaseNumber.set(this.purchaseNumber());
    });

    this.purchaseNumberInput$
      .pipe(
        debounceTime(PURCHASE_NUMBER_FILTER_DEBOUNCE_MS),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((value) => {
        this.emitFilters({ purchaseNumber: value });
      });
  }

  readonly statusOptions: FilterOption[] = [
    { label: 'All statuses', value: null },
    ...numericEnumValues(PurchaseState).map((v) => ({
      label: purchaseStateLabel(v),
      value: v
    }))
  ];

  onPurchaseNumberInput(value: string): void {
    this.localPurchaseNumber.set(value);
    this.purchaseNumberInput$.next(value);
  }

  onStatusChange(value: number | null | undefined): void {
    this.emitFilters({ status: value ?? null });
  }

  onClear(): void {
    this.clearFilters.emit();
  }

  private emitFilters(patch: Partial<PurchaseOrdersListFilters>): void {
    this.filtersChange.emit({
      purchaseNumber: patch.purchaseNumber ?? this.localPurchaseNumber(),
      status: patch.status !== undefined ? patch.status : this.status()
    });
  }
}

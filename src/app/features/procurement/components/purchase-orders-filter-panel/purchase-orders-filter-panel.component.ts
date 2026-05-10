import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
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
  purchaseNumber = input<string>('');
  status = input<number | null>(null);
  loading = input(false);

  filtersChange = output<PurchaseOrdersListFilters>();
  clearFilters = output<void>();

  readonly statusOptions: FilterOption[] = [
    { label: 'All statuses', value: null },
    ...numericEnumValues(PurchaseState).map((v) => ({
      label: purchaseStateLabel(v),
      value: v
    }))
  ];

  onPurchaseNumberInput(value: string): void {
    this.emitFilters({ purchaseNumber: value });
  }

  onStatusChange(value: number | null | undefined): void {
    this.emitFilters({ status: value ?? null });
  }

  onClear(): void {
    this.clearFilters.emit();
  }

  private emitFilters(patch: Partial<PurchaseOrdersListFilters>): void {
    this.filtersChange.emit({
      purchaseNumber: patch.purchaseNumber ?? this.purchaseNumber(),
      status: patch.status !== undefined ? patch.status : this.status()
    });
  }
}

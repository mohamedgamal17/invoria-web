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
import { PurchaseState } from '../../enums/purchase-state.enum';
import type { PurchaseOrdersListFilters } from '../../models/purchase-orders-list.filters';
import { purchaseStateLabel } from '../../models/purchase-state.display';

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
    SurfaceCardComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './purchase-orders-filter-panel.component.html',
})
export class PurchaseOrdersFilterPanelComponent {
  purchaseNumber = input<string>('');
  status = input<number | null>(null);
  loading = input(false);

  filtersChange = output<PurchaseOrdersListFilters>();
  clearFilters = output<void>();

  private readonly debouncedPurchaseNumber = createDebouncedInput(this.purchaseNumber, (value) =>
    this.emitFilters({ purchaseNumber: value }),
  );

  readonly localPurchaseNumber = this.debouncedPurchaseNumber.value;

  readonly statusOptions: SelectOption<number | null>[] = buildSelectOptions(
    numericEnumValues(PurchaseState),
    purchaseStateLabel,
    { label: 'All statuses', value: null },
  );

  onPurchaseNumberInput(value: string): void {
    this.debouncedPurchaseNumber.set(value);
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
      status: patch.status !== undefined ? patch.status : this.status(),
    });
  }
}

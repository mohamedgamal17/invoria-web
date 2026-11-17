import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';

import type { SelectOption } from '../../../../shared/models/select-option';
import { SurfaceCardComponent } from '../../../../shared/ui/surface-card/surface-card.component';
import { numericEnumValues } from '../../../../shared/utils/numeric-enum-values';
import { buildSelectOptions } from '../../../../shared/utils/select-options';
import { ReturnType, returnTypeLabel } from '../../models/return-type.enum';
import type { ReturnsListFilters } from '../../models/returns-list.filters';

@Component({
  selector: 'app-returns-filter-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, SelectModule, SurfaceCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './returns-filter-panel.component.html',
})
export class ReturnsFilterPanelComponent {
  type = input<number | null>(null);
  loading = input(false);

  filtersChange = output<ReturnsListFilters>();
  clearFilters = output<void>();

  readonly typeOptions: SelectOption<number | null>[] = buildSelectOptions(
    numericEnumValues(ReturnType),
    returnTypeLabel,
    { label: 'All types', value: null },
  );

  onTypeChange(value: number | null | undefined): void {
    this.filtersChange.emit({ type: value ?? null });
  }

  onClear(): void {
    this.clearFilters.emit();
  }
}

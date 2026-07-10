import { CommonModule } from '@angular/common';
import { Component, effect, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';

import { SurfaceCardComponent } from '../../../../shared/ui/surface-card/surface-card.component';
import { ReturnType, returnTypeLabel } from '../../models/return-type.enum';

export type ReturnsListFilters = {
  type: number | null;
};

type FilterOption = { label: string; value: number | null };

function numericEnumValues<T extends Record<string, string | number>>(e: T): number[] {
  return Object.values(e).filter((v): v is number => typeof v === 'number');
}

@Component({
  selector: 'app-returns-filter-panel',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    SelectModule,
    SurfaceCardComponent
  ],
  templateUrl: './returns-filter-panel.component.html'
})
export class ReturnsFilterPanelComponent {
  type = input<number | null>(null);
  loading = input(false);

  filtersChange = output<ReturnsListFilters>();
  clearFilters = output<void>();

  readonly typeOptions: FilterOption[] = [
    { label: 'All types', value: null },
    ...numericEnumValues(ReturnType).map((v) => ({
      label: returnTypeLabel(v),
      value: v
    }))
  ];

  onTypeChange(value: number | null | undefined): void {
    this.filtersChange.emit({ type: value ?? null });
  }

  onClear(): void {
    this.clearFilters.emit();
  }
}

import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';

import { createDebouncedInput } from '../../../../shared/utils/debounce-input';
import type { SelectOption } from '../../../../shared/models/select-option';
import { SurfaceCardComponent } from '../../../../shared/ui/surface-card/surface-card.component';
import type { ReceivablesListFilters } from '../../models/receivables-list.filters';

@Component({
  selector: 'app-receivables-filter-panel',
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
  templateUrl: './receivables-filter-panel.component.html',
})
export class ReceivablesFilterPanelComponent {
  partyId = input<string>('');
  sourceId = input<string>('');
  isPaid = input<boolean | null>(null);
  loading = input(false);

  filtersChange = output<ReceivablesListFilters>();
  clearFilters = output<void>();

  readonly isPaidOptions: SelectOption<boolean | null>[] = [
    { label: 'All', value: null },
    { label: 'Paid', value: true },
    { label: 'Unpaid', value: false },
  ];

  private readonly debouncedPartyId = createDebouncedInput(this.partyId, (value) =>
    this.emitFilters({ partyId: value }),
  );

  private readonly debouncedSourceId = createDebouncedInput(this.sourceId, (value) =>
    this.emitFilters({ sourceId: value }),
  );

  readonly localPartyId = this.debouncedPartyId.value;
  readonly localSourceId = this.debouncedSourceId.value;

  onPartyIdInput(value: string): void {
    this.debouncedPartyId.set(value);
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

  private emitFilters(patch: Partial<ReceivablesListFilters>): void {
    this.filtersChange.emit({
      partyId: patch.partyId !== undefined ? patch.partyId : this.localPartyId(),
      sourceId: patch.sourceId !== undefined ? patch.sourceId : this.localSourceId(),
      isPaid: patch.isPaid !== undefined ? patch.isPaid : this.isPaid(),
    });
  }
}

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

export type ReceivablesListFilters = {
  partyId: string;
  sourceId: string;
  isPaid: boolean | null;
};

type PaidFilterOption = { label: string; value: boolean | null };

const RECEIVABLE_FILTER_DEBOUNCE_MS = 700;

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
    SurfaceCardComponent
  ],
  templateUrl: './receivables-filter-panel.component.html'
})
export class ReceivablesFilterPanelComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly partyIdInput$ = new Subject<string>();
  private readonly sourceIdInput$ = new Subject<string>();

  partyId = input<string>('');
  sourceId = input<string>('');
  isPaid = input<boolean | null>(null);
  loading = input(false);

  readonly localPartyId = signal('');
  readonly localSourceId = signal('');

  filtersChange = output<ReceivablesListFilters>();
  clearFilters = output<void>();

  readonly isPaidOptions: PaidFilterOption[] = [
    { label: 'All', value: null },
    { label: 'Paid', value: true },
    { label: 'Unpaid', value: false }
  ];

  constructor() {
    effect(() => {
      this.localPartyId.set(this.partyId());
    });

    effect(() => {
      this.localSourceId.set(this.sourceId());
    });

    this.partyIdInput$
      .pipe(
        debounceTime(RECEIVABLE_FILTER_DEBOUNCE_MS),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((value) => {
        this.emitFilters({ partyId: value });
      });

    this.sourceIdInput$
      .pipe(
        debounceTime(RECEIVABLE_FILTER_DEBOUNCE_MS),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((value) => {
        this.emitFilters({ sourceId: value });
      });
  }

  onPartyIdInput(value: string): void {
    this.localPartyId.set(value);
    this.partyIdInput$.next(value);
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

  private emitFilters(patch: Partial<ReceivablesListFilters>): void {
    this.filtersChange.emit({
      partyId: patch.partyId !== undefined ? patch.partyId : this.localPartyId(),
      sourceId: patch.sourceId !== undefined ? patch.sourceId : this.localSourceId(),
      isPaid: patch.isPaid !== undefined ? patch.isPaid : this.isPaid()
    });
  }
}

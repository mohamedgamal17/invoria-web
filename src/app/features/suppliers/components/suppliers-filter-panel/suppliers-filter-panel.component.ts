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

export type SuppliersListFilters = {
  name: string;
};

/** Mirrors `PRODUCT_NAME_FILTER_DEBOUNCE_MS` in products filter panel. */
const SUPPLIER_NAME_FILTER_DEBOUNCE_MS = 700;

@Component({
  selector: 'app-suppliers-filter-panel',
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
  templateUrl: './suppliers-filter-panel.component.html'
})
export class SuppliersFilterPanelComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly nameInput$ = new Subject<string>();

  name = input<string>('');
  loading = input(false);

  readonly localName = signal('');

  filtersChange = output<SuppliersListFilters>();
  clearFilters = output<void>();

  constructor() {
    effect(() => {
      this.localName.set(this.name());
    });

    this.nameInput$
      .pipe(
        debounceTime(SUPPLIER_NAME_FILTER_DEBOUNCE_MS),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((value) => {
        this.emitFilters({ name: value });
      });
  }

  onNameInput(value: string): void {
    this.localName.set(value);
    this.nameInput$.next(value);
  }

  onClear(): void {
    this.clearFilters.emit();
  }

  private emitFilters(patch: Partial<SuppliersListFilters>): void {
    this.filtersChange.emit({
      name: patch.name !== undefined ? patch.name : this.localName()
    });
  }
}

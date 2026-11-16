import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';

import { SEARCH_DEBOUNCE_MS } from '../../models/debounce';
import { SurfaceCardComponent } from '../surface-card/surface-card.component';

export type NameListFilters = {
  name: string;
};

/**
 * Name-only filter panel shared by the customers, suppliers and products lists.
 * The draft value is debounced before being emitted; clearing is delegated to
 * the parent so URL ownership stays with the page.
 */
@Component({
  selector: 'app-name-filter-panel',
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
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './name-filter-panel.component.html'
})
export class NameFilterPanelComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly nameInput$ = new Subject<string>();

  name = input<string>('');
  loading = input(false);
  label = input('Name');
  inputId = input('name-filter');

  readonly localName = signal('');

  filtersChange = output<NameListFilters>();
  clearFilters = output<void>();

  constructor() {
    effect(() => {
      this.localName.set(this.name());
    });

    this.nameInput$
      .pipe(
        debounceTime(SEARCH_DEBOUNCE_MS),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((value) => this.filtersChange.emit({ name: value }));
  }

  onNameInput(value: string): void {
    this.localName.set(value);
    this.nameInput$.next(value);
  }

  onClear(): void {
    this.clearFilters.emit();
  }
}

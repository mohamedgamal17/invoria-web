import { CommonModule } from '@angular/common';
import { Component, DestroyRef, effect, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, distinctUntilChanged, map, of, switchMap, timer } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { PaginatorModule } from 'primeng/paginator';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import type { PaginatorState } from 'primeng/paginator';
import type { TablePageEvent } from 'primeng/table';
import { EmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state.component';
import { SurfaceCardComponent } from '../../../../shared/ui/surface-card/surface-card.component';

import type { Product } from '../../models/product.entity';

const SEARCH_DEBOUNCE_MS = 300;

type SearchAction =
  | { kind: 'input'; value: string }
  | { kind: 'clear' };

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    TableModule,
    PaginatorModule,
    SkeletonModule,
    TagModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    EmptyStateComponent,
    SurfaceCardComponent
  ],
  templateUrl: './product-list.component.html'
})
export class ProductListComponent {
  private readonly destroyRef = inject(DestroyRef);

  products = input.required<Product[]>();
  totalRecords = input.required<number>();
  first = input.required<number>();
  pageSize = input.required<number>();
  isListLoading = input.required<boolean>();
  pageSizeOptions = input<number[]>([25, 50, 100, 200]);

  /** Current name filter from route (parent); drives display sync when URL changes. */
  nameSearch = input<string>('');

  viewProduct = output<Product>();
  pageChange = output<PaginatorState | TablePageEvent>();
  nameSearchChange = output<string>();

  /** Local value for the search box while typing (before debounced navigation). */
  readonly nameDraft = signal('');

  private readonly searchAction$ = new Subject<SearchAction>();

  constructor() {
    effect(() => {
      this.nameDraft.set(this.nameSearch());
    });

    this.searchAction$
      .pipe(
        switchMap((action) => {
          if (action.kind === 'clear') {
            return of('');
          }
          return timer(SEARCH_DEBOUNCE_MS).pipe(map(() => action.value));
        }),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((term) => this.nameSearchChange.emit(term));
  }

  onNameSearchInput(raw: string): void {
    this.nameDraft.set(raw);
    this.searchAction$.next({ kind: 'input', value: raw });
  }

  clearNameSearch(): void {
    this.nameDraft.set('');
    this.searchAction$.next({ kind: 'clear' });
  }

  formatQuantitySummary(actualQuantity: number, reservedQuantity: number): string {
    return `Actual ${actualQuantity} / Reserved ${reservedQuantity}`;
  }

  get skeletonRows(): number[] {
    return Array.from({ length: this.pageSize() }, (_, i) => i);
  }
}

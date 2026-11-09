import { Component, inject, untracked } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';

import { Store } from '@ngrx/store';
import { ToastModule } from 'primeng/toast';
import type { PaginatorState } from 'primeng/paginator';
import type { TablePageEvent } from 'primeng/table';

import { PaginationService } from '../../../../shared/utils/pagination.service';
import { DEFAULT_PAGE_SIZE_OPTIONS } from '../../../../shared/models/pagination';
import { SuppliersApiService } from '../../../suppliers/services/suppliers-api.service';
import { payablesListSelectors } from '../../store/payables-list/payables-list.selectors';
import type { Payable } from '../../models/payable.entity';
import { PayableListComponent } from '../../components/payable-list/payable-list.component';
import { PayableHeaderComponent } from '../../components/payable-header/payable-header.component';
import {
  PayablesFilterPanelComponent,
  type PayablesListFilters
} from '../../components/payables-filter-panel/payables-filter-panel.component';

const SUPPLIER_OPTIONS_PAGE_SIZE = 200;

/**
 * Smart page (container) for the payables list. It owns only:
 * - the NgRx state mapping (selectors → signals),
 * - the URL write adapter (`page` / `pageSize` / `supplierId` / `sourceId` /
 *   `isPaid` query params via merge),
 * - presentation glue (scroll behavior, page navigation),
 * - static dropdown options for the filter panel.
 * The URL *read* side lives in the `store/payables-list-url` effects
 * (NgRx Router Store); all business logic lives in the
 * `store/payables-list` state module, including error presentation
 * (global `AppErrorEffects` toast).
 */
@Component({
  selector: 'app-payables-page',
  standalone: true,
  imports: [
    ToastModule,
    PayableHeaderComponent,
    PayablesFilterPanelComponent,
    PayableListComponent
  ],
  templateUrl: './payables-page.component.html'
})
export class PayablesPageComponent {
  readonly pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS;

  private readonly store = inject(Store);
  private readonly pagination = inject(PaginationService);
  private readonly suppliersApi = inject(SuppliersApiService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  // --- Payables list store (URL-backed paging + filters) ---
  readonly payables = this.store.selectSignal(payablesListSelectors.selectPayables);
  readonly paging = this.store.selectSignal(payablesListSelectors.selectPaging);
  readonly listLoading = this.store.selectSignal(payablesListSelectors.selectIsLoading);
  readonly supplierIdFilter = this.store.selectSignal(payablesListSelectors.selectSupplierIdFilter);
  readonly sourceIdFilter = this.store.selectSignal(payablesListSelectors.selectSourceIdFilter);
  readonly isPaidFilter = this.store.selectSignal(payablesListSelectors.selectIsPaidFilter);
  readonly first = this.store.selectSignal(payablesListSelectors.selectFirst);
  readonly pageSize = this.store.selectSignal(payablesListSelectors.selectPageSize);
  private readonly pageIndex = this.store.selectSignal(payablesListSelectors.selectPageIndex);

  /** Supplier options for the filter dropdown (loaded once; static view data). */
  readonly suppliersResource = rxResource<{ id: string; name: string }[], void>({
    params: () => undefined,
    defaultValue: [],
    stream: () =>
      this.suppliersApi.searchSuppliers({ Skip: 0, Length: SUPPLIER_OPTIONS_PAGE_SIZE }).pipe(
        map((suppliers) => suppliers.map((supplier) => ({ id: supplier.id, name: supplier.name }))),
        catchError(() => of([]))
      )
  });

  goToDetails(payable: Payable): void {
    void this.router.navigate([payable.id], { relativeTo: this.route });
  }

  onPageChange(event: PaginatorState | TablePageEvent): void {
    const { pageIndex, pageSize } = this.pagination.pageIndexFromEvent(
      event,
      untracked(this.pageSize),
    );
    // Presentation glue only: page navigation scrolls to top; the state
    // (reducer) decides whether the change is real and warrants an API call.
    const isManualPageChange = pageIndex !== untracked(this.pageIndex);

    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: pageIndex + 1, pageSize },
      queryParamsHandling: 'merge'
    });

    if (isManualPageChange) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  onFiltersChange(filters: PayablesListFilters): void {
    const normalizedSupplierId = filters.supplierId.trim();
    const normalizedSourceId = filters.sourceId.trim();

    if (
      normalizedSupplierId === untracked(this.supplierIdFilter) &&
      normalizedSourceId === untracked(this.sourceIdFilter) &&
      filters.isPaid === untracked(this.isPaidFilter)
    ) {
      return;
    }

    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        supplierId: normalizedSupplierId || null,
        sourceId: normalizedSourceId || null,
        isPaid:
          filters.isPaid === null || filters.isPaid === undefined
            ? null
            : String(filters.isPaid),
        page: 1
      },
      queryParamsHandling: 'merge'
    });
  }

  onClearFilters(): void {
    if (
      !untracked(this.supplierIdFilter) &&
      !untracked(this.sourceIdFilter) &&
      untracked(this.isPaidFilter) === null
    ) {
      return;
    }

    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { supplierId: null, sourceId: null, isPaid: null, page: 1 },
      queryParamsHandling: 'merge'
    });
  }
}

import { Component, inject, untracked } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { ToastModule } from 'primeng/toast';
import type { PaginatorState } from 'primeng/paginator';
import type { TablePageEvent } from 'primeng/table';

import { PaginationService } from '../../../../shared/utils/pagination.service';
import { DEFAULT_PAGE_SIZE_OPTIONS } from '../../../../shared/models/pagination';
import { receivablesListSelectors } from '../../store/receivables-list/receivables-list.selectors';
import type { Receivable } from '../../models/receivable.entity';
import { ReceivableListComponent } from '../../components/receivable-list/receivable-list.component';
import { ReceivableHeaderComponent } from '../../components/receivable-header/receivable-header.component';
import {
  ReceivablesFilterPanelComponent,
  type ReceivablesListFilters,
} from '../../components/receivables-filter-panel/receivables-filter-panel.component';

/**
 * Smart page (container) for the receivables list. It owns only:
 * - the NgRx state mapping (selectors → signals),
 * - the URL write adapter (`page` / `pageSize` / `partyId` / `sourceId` /
 *   `isPaid` query params via merge),
 * - presentation glue (scroll behavior, page navigation).
 * The URL *read* side lives in the `store/receivables-list-url` effects
 * (NgRx Router Store); all business logic lives in the
 * `store/receivables-list` state module, including error presentation
 * (global `AppErrorEffects` toast).
 */
@Component({
  selector: 'app-receivables-page',
  standalone: true,
  imports: [
    ToastModule,
    ReceivableHeaderComponent,
    ReceivablesFilterPanelComponent,
    ReceivableListComponent,
  ],
  templateUrl: './receivables-page.component.html',
})
export class ReceivablesPageComponent {
  readonly pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS;

  private readonly store = inject(Store);
  private readonly pagination = inject(PaginationService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  // --- Receivables list store (URL-backed paging + filters) ---
  readonly receivables = this.store.selectSignal(receivablesListSelectors.selectReceivables);
  readonly paging = this.store.selectSignal(receivablesListSelectors.selectPaging);
  readonly listLoading = this.store.selectSignal(receivablesListSelectors.selectIsLoading);
  readonly partyIdFilter = this.store.selectSignal(receivablesListSelectors.selectPartyIdFilter);
  readonly sourceIdFilter = this.store.selectSignal(receivablesListSelectors.selectSourceIdFilter);
  readonly isPaidFilter = this.store.selectSignal(receivablesListSelectors.selectIsPaidFilter);
  readonly first = this.store.selectSignal(receivablesListSelectors.selectFirst);
  readonly pageSize = this.store.selectSignal(receivablesListSelectors.selectPageSize);
  private readonly pageIndex = this.store.selectSignal(receivablesListSelectors.selectPageIndex);

  goToDetails(receivable: Receivable): void {
    void this.router.navigate([receivable.id], { relativeTo: this.route });
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
      queryParamsHandling: 'merge',
    });

    if (isManualPageChange) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  onFiltersChange(filters: ReceivablesListFilters): void {
    const normalizedPartyId = filters.partyId.trim();
    const normalizedSourceId = filters.sourceId.trim();

    if (
      normalizedPartyId === untracked(this.partyIdFilter) &&
      normalizedSourceId === untracked(this.sourceIdFilter) &&
      filters.isPaid === untracked(this.isPaidFilter)
    ) {
      return;
    }

    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        partyId: normalizedPartyId || null,
        sourceId: normalizedSourceId || null,
        isPaid:
          filters.isPaid === null || filters.isPaid === undefined ? null : String(filters.isPaid),
        page: 1,
      },
      queryParamsHandling: 'merge',
    });
  }

  onClearFilters(): void {
    if (
      !untracked(this.partyIdFilter) &&
      !untracked(this.sourceIdFilter) &&
      untracked(this.isPaidFilter) === null
    ) {
      return;
    }

    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { partyId: null, sourceId: null, isPaid: null, page: 1 },
      queryParamsHandling: 'merge',
    });
  }
}

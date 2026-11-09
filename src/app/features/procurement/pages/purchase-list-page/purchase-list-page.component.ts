import { Component, inject, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { ToastModule } from 'primeng/toast';
import type { PaginatorState } from 'primeng/paginator';
import type { TablePageEvent } from 'primeng/table';

import { Store } from '@ngrx/store';

import type { PurchaseOrder } from '../../models/purchase-order.entity';
import { PurchaseOrderHeaderComponent } from '../../components/purchase-order-header/purchase-order-header.component';
import { PurchaseOrderListComponent } from '../../components/purchase-order-list/purchase-order-list.component';
import {
  PurchaseOrdersFilterPanelComponent,
  type PurchaseOrdersListFilters,
} from '../../components/purchase-orders-filter-panel/purchase-orders-filter-panel.component';
import { PaginationService } from '../../../../shared/utils/pagination.service';
import { DEFAULT_PAGE_SIZE_OPTIONS } from '../../../../shared/models/pagination';
import { purchaseOrdersListSelectors } from '../../store/purchase-orders-list/purchase-orders-list.selectors';

@Component({
  selector: 'app-purchase-list-page',
  standalone: true,
  imports: [
    CommonModule,
    ToastModule,
    PurchaseOrderHeaderComponent,
    PurchaseOrdersFilterPanelComponent,
    PurchaseOrderListComponent,
  ],
  templateUrl: './purchase-list-page.component.html',
})
/**
 * Smart page (container) for the purchase orders list. It owns only:
 * - the NgRx state mapping (selectors → signals),
 * - the URL write adapter (`page` / `pageSize` / `number` / `status` query params via merge),
 * - presentation glue (scroll behavior, page navigation).
 * The URL *read* side lives in the `store/purchase-orders-list-url` effects
 * (NgRx Router Store); all business logic lives in the
 * `store/purchase-orders-list` state module, including error presentation
 * (global `AppErrorEffects` toast).
 */
export class PurchaseListPageComponent {
  readonly pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS;

  private readonly store = inject(Store);
  private readonly pagination = inject(PaginationService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  // --- Purchase orders list store (URL-backed paging + number/status filters) ---
  readonly purchaseOrders = this.store.selectSignal(
    purchaseOrdersListSelectors.selectPurchaseOrders,
  );
  readonly paging = this.store.selectSignal(purchaseOrdersListSelectors.selectPaging);
  readonly listLoading = this.store.selectSignal(purchaseOrdersListSelectors.selectIsLoading);
  readonly pageIndex = this.store.selectSignal(purchaseOrdersListSelectors.selectPageIndex);
  readonly pageSize = this.store.selectSignal(purchaseOrdersListSelectors.selectPageSize);
  readonly purchaseNumber = this.store.selectSignal(purchaseOrdersListSelectors.selectNumberFilter);
  readonly purchaseStatusFilter = this.store.selectSignal(
    purchaseOrdersListSelectors.selectStatusFilter,
  );
  readonly first = this.store.selectSignal(purchaseOrdersListSelectors.selectFirst);

  goToDetails(po: PurchaseOrder): void {
    void this.router.navigate([po.id], { relativeTo: this.route });
  }

  goToCreate(): void {
    void this.router.navigate(['new'], { relativeTo: this.route });
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

  onFiltersChange(filters: PurchaseOrdersListFilters): void {
    const numberFilter = filters.purchaseNumber.trim();
    if (
      numberFilter === untracked(this.purchaseNumber) &&
      filters.status === untracked(this.purchaseStatusFilter)
    ) {
      return;
    }

    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        number: numberFilter || null,
        status: filters.status != null ? String(filters.status) : null,
        page: 1,
      },
      queryParamsHandling: 'merge',
    });
  }

  onClearFilters(): void {
    if (!untracked(this.purchaseNumber) && untracked(this.purchaseStatusFilter) == null) {
      return;
    }

    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        number: null,
        status: null,
        page: 1,
      },
      queryParamsHandling: 'merge',
    });
  }
}

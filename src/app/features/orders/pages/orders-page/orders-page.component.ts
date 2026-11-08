import { Component, inject, untracked } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Store } from '@ngrx/store';

import { PaginationService } from '../../../../shared/utils/pagination.service';
import {
  DEFAULT_PAGE_SIZE_OPTIONS,
  type PaginatorPageEvent
} from '../../../../shared/models/pagination';
import { ordersListSelectors } from '../../store/orders-list/orders-list.selectors';
import type { UiOrder } from '../../models/order-ui.model';
import { OrderHeaderComponent } from '../../components/order-header/order-header.component';
import {
  OrdersFilterPanelComponent,
  type OrdersListFilters
} from '../../components/orders-filter-panel/orders-filter-panel.component';
import { OrderListComponent } from '../../components/order-list/order-list.component';

@Component({
  selector: 'app-orders-page',
  standalone: true,
  imports: [OrderHeaderComponent, OrdersFilterPanelComponent, OrderListComponent],
  templateUrl: './orders-page.component.html'
})
export class OrdersPageComponent {
  readonly pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS;

  private readonly store = inject(Store);
  private readonly pagination = inject(PaginationService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  // --- Orders list store (URL-backed paging + filters) ---
  readonly orders = this.store.selectSignal(ordersListSelectors.selectOrders);
  readonly paging = this.store.selectSignal(ordersListSelectors.selectPaging);
  readonly listLoading = this.store.selectSignal(ordersListSelectors.selectIsLoading);
  readonly pageIndex = this.store.selectSignal(ordersListSelectors.selectPageIndex);
  readonly pageSize = this.store.selectSignal(ordersListSelectors.selectPageSize);
  readonly orderNumberFilter = this.store.selectSignal(ordersListSelectors.selectOrderNumberFilter);
  readonly statusFilter = this.store.selectSignal(ordersListSelectors.selectStatusFilter);
  readonly paymentStatusFilter = this.store.selectSignal(ordersListSelectors.selectPaymentStatusFilter);
  readonly paymentTypeFilter = this.store.selectSignal(ordersListSelectors.selectPaymentTypeFilter);
  readonly first = this.store.selectSignal(ordersListSelectors.selectFirst);

  goToCreatePage(): void {
    void this.router.navigate(['new'], { relativeTo: this.route });
  }

  goToDetails(order: UiOrder): void {
    void this.router.navigate([order.id], { relativeTo: this.route });
  }

  onPageChange(event: PaginatorPageEvent): void {
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

  onFiltersChange(filters: OrdersListFilters): void {
    const normalized = filters.orderNumber.trim();
    if (
      normalized === untracked(this.orderNumberFilter) &&
      filters.status === untracked(this.statusFilter) &&
      filters.paymentStatus === untracked(this.paymentStatusFilter) &&
      filters.paymentType === untracked(this.paymentTypeFilter)
    ) {
      return;
    }

    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        q: normalized || null,
        status: filters.status != null ? String(filters.status) : null,
        paymentStatus:
          filters.paymentStatus != null ? String(filters.paymentStatus) : null,
        paymentType: filters.paymentType != null ? String(filters.paymentType) : null,
        page: 1
      },
      queryParamsHandling: 'merge'
    });
  }

  onClearFilters(): void {
    if (
      !untracked(this.orderNumberFilter) &&
      untracked(this.statusFilter) == null &&
      untracked(this.paymentStatusFilter) == null &&
      untracked(this.paymentTypeFilter) == null
    ) {
      return;
    }

    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        q: null,
        status: null,
        paymentStatus: null,
        paymentType: null,
        page: 1
      },
      queryParamsHandling: 'merge'
    });
  }
}

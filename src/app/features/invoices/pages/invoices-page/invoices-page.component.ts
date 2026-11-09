import { Component, inject, untracked } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Store } from '@ngrx/store';
import type { PaginatorState } from 'primeng/paginator';
import type { TablePageEvent } from 'primeng/table';

import { type Invoice } from '../../models/invoice.entity';
import { InvoiceListComponent } from '../../components/invoice-list/invoice-list.component';
import { InvoiceHeaderComponent } from '../../components/invoice-header/invoice-header.component';
import {
  InvoicesFilterPanelComponent,
  type InvoicesListFilters
} from '../../components/invoices-filter-panel/invoices-filter-panel.component';
import { DEFAULT_PAGE_SIZE_OPTIONS } from '../../../../shared/models/pagination';
import { PaginationService } from '../../../../shared/utils/pagination.service';
import { invoicesListSelectors } from '../../store/invoices-list/invoices-list.selectors';

/**
 * Smart page (container) for the invoices list. It owns only:
 * - the NgRx state mapping (selectors → signals),
 * - the URL write adapter (`page` / `pageSize` / `customerId` / `orderId`
 *   query params via merge),
 * - presentation glue (scroll behavior, details navigation).
 * The URL *read* side lives in the `store/invoices-list-url` effects
 * (NgRx Router Store); all business logic lives in the
 * `store/invoices-list` state module, including error presentation
 * (global `AppErrorEffects` toast).
 */
@Component({
  selector: 'app-invoices-page',
  standalone: true,
  imports: [
    InvoiceHeaderComponent,
    InvoicesFilterPanelComponent,
    InvoiceListComponent
  ],
  templateUrl: './invoices-page.component.html'
})
export class InvoicesPageComponent {
  readonly pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS;

  private readonly store = inject(Store);
  private readonly pagination = inject(PaginationService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  // --- Invoices list store (URL-backed paging + entity filters) ---
  readonly displayInvoices = this.store.selectSignal(invoicesListSelectors.selectInvoices);
  readonly displayPaging = this.store.selectSignal(invoicesListSelectors.selectPaging);
  readonly listLoading = this.store.selectSignal(invoicesListSelectors.selectIsLoading);
  readonly pageIndex = this.store.selectSignal(invoicesListSelectors.selectPageIndex);
  readonly pageSize = this.store.selectSignal(invoicesListSelectors.selectPageSize);
  readonly customerIdFromRoute = this.store.selectSignal(invoicesListSelectors.selectCustomerIdFilter);
  readonly orderIdFromRoute = this.store.selectSignal(invoicesListSelectors.selectOrderIdFilter);
  readonly first = this.store.selectSignal(invoicesListSelectors.selectFirst);

  goToDetails(invoice: Invoice): void {
    void this.router.navigate([invoice.id], { relativeTo: this.route });
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

  onFiltersChange(filters: InvoicesListFilters): void {
    const customerIdFilter = filters.customerId.trim();
    const orderIdFilter = filters.orderId.trim();
    if (
      customerIdFilter === untracked(this.customerIdFromRoute) &&
      orderIdFilter === untracked(this.orderIdFromRoute)
    ) {
      return;
    }

    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        customerId: customerIdFilter || null,
        orderId: orderIdFilter || null,
        page: 1
      },
      queryParamsHandling: 'merge'
    });
  }

  onClearFilters(): void {
    if (!untracked(this.customerIdFromRoute) && !untracked(this.orderIdFromRoute)) {
      return;
    }

    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { customerId: null, orderId: null, page: 1 },
      queryParamsHandling: 'merge'
    });
  }
}

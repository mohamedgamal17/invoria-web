import { Component, inject, untracked } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Store } from '@ngrx/store';
import { ToastModule } from 'primeng/toast';
import type { PaginatorState } from 'primeng/paginator';
import type { TablePageEvent } from 'primeng/table';

import { PaginationService } from '../../../../shared/utils/pagination.service';
import { DEFAULT_PAGE_SIZE_OPTIONS } from '../../../../shared/models/pagination';
import { customersListSelectors } from '../../store/customers-list/customers-list.selectors';
import type { Customer } from '../../models/customer.entity';
import { CustomerListComponent } from '../../components/customer-list/customer-list.component';
import { CustomerHeaderComponent } from '../../components/customer-header/customer-header.component';
import {
  CustomersFilterPanelComponent,
  type CustomersListFilters
} from '../../components/customers-filter-panel/customers-filter-panel.component';

/**
 * Smart page (container) for the customers list. It owns only:
 * - the NgRx state mapping (selectors → signals),
 * - the URL write adapter (`page` / `pageSize` / `q` query params via merge),
 * - presentation glue (scroll behavior, page navigation).
 * The URL *read* side lives in the `store/customers-list-url` effects
 * (NgRx Router Store); all business logic lives in the
 * `store/customers-list` state module, including error presentation
 * (global `AppErrorEffects` toast).
 */
@Component({
  selector: 'app-customers-page',
  standalone: true,
  imports: [
    ToastModule,
    CustomerHeaderComponent,
    CustomersFilterPanelComponent,
    CustomerListComponent
  ],
  templateUrl: './customers-page.component.html'
})
export class CustomersPageComponent {
  readonly pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS;

  private readonly store = inject(Store);
  private readonly pagination = inject(PaginationService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  // --- Customers list store (URL-backed paging + name filter) ---
  readonly customers = this.store.selectSignal(customersListSelectors.selectCustomers);
  readonly paging = this.store.selectSignal(customersListSelectors.selectPaging);
  readonly listLoading = this.store.selectSignal(customersListSelectors.selectIsLoading);
  readonly pageIndex = this.store.selectSignal(customersListSelectors.selectPageIndex);
  readonly pageSize = this.store.selectSignal(customersListSelectors.selectPageSize);
  readonly nameFilter = this.store.selectSignal(customersListSelectors.selectNameFilter);
  readonly first = this.store.selectSignal(customersListSelectors.selectFirst);

  goToCreate(): void {
    void this.router.navigate(['new'], { relativeTo: this.route });
  }

  goToDetails(customer: Customer): void {
    void this.router.navigate([customer.id], { relativeTo: this.route });
  }

  onPageChange(event: PaginatorState | TablePageEvent): void {
    const { pageIndex, pageSize } = this.pagination.pageIndexFromEvent(
      event,
      untracked(this.pageSize)
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

  onFiltersChange(filters: CustomersListFilters): void {
    const nameFilter = filters.name.trim();
    if (nameFilter === untracked(this.nameFilter)) {
      return;
    }

    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { q: nameFilter || null, page: 1 },
      queryParamsHandling: 'merge'
    });
  }

  onClearFilters(): void {
    if (!untracked(this.nameFilter)) {
      return;
    }

    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { q: null, page: 1 },
      queryParamsHandling: 'merge'
    });
  }
}

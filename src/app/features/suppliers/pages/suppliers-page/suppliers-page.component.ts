import { Component, inject, untracked } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Store } from '@ngrx/store';
import { ToastModule } from 'primeng/toast';
import type { PaginatorState } from 'primeng/paginator';
import type { TablePageEvent } from 'primeng/table';

import { PaginationService } from '../../../../shared/utils/pagination.service';
import { DEFAULT_PAGE_SIZE_OPTIONS } from '../../../../shared/models/pagination';
import { suppliersListSelectors } from '../../store/suppliers-list/suppliers-list.selectors';
import type { Supplier } from '../../models/supplier.entity';
import { SupplierListComponent } from '../../components/supplier-list/supplier-list.component';
import { SupplierHeaderComponent } from '../../components/supplier-header/supplier-header.component';
import {
  SuppliersFilterPanelComponent,
  type SuppliersListFilters,
} from '../../components/suppliers-filter-panel/suppliers-filter-panel.component';

/**
 * Smart page (container) for the suppliers list. It owns only:
 * - the NgRx state mapping (selectors → signals),
 * - the URL write adapter (`page` / `pageSize` / `q` query params via merge),
 * - presentation glue (scroll behavior, page navigation).
 * The URL *read* side lives in the `store/suppliers-list-url` effects
 * (NgRx Router Store); all business logic lives in the
 * `store/suppliers-list` state module, including error presentation
 * (global `AppErrorEffects` toast).
 */
@Component({
  selector: 'app-suppliers-page',
  standalone: true,
  imports: [
    ToastModule,
    SupplierHeaderComponent,
    SuppliersFilterPanelComponent,
    SupplierListComponent,
  ],
  templateUrl: './suppliers-page.component.html',
})
export class SuppliersPageComponent {
  readonly pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS;

  private readonly store = inject(Store);
  private readonly pagination = inject(PaginationService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  // --- Suppliers list store (URL-backed paging + name filter) ---
  readonly suppliers = this.store.selectSignal(suppliersListSelectors.selectSuppliers);
  readonly paging = this.store.selectSignal(suppliersListSelectors.selectPaging);
  readonly listLoading = this.store.selectSignal(suppliersListSelectors.selectIsLoading);
  readonly pageIndex = this.store.selectSignal(suppliersListSelectors.selectPageIndex);
  readonly pageSize = this.store.selectSignal(suppliersListSelectors.selectPageSize);
  readonly nameFilter = this.store.selectSignal(suppliersListSelectors.selectNameFilter);
  readonly first = this.store.selectSignal(suppliersListSelectors.selectFirst);

  goToCreate(): void {
    void this.router.navigate(['new'], { relativeTo: this.route });
  }

  goToDetails(supplier: Supplier): void {
    void this.router.navigate([supplier.id], { relativeTo: this.route });
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

  onFiltersChange(filters: SuppliersListFilters): void {
    const nameFilter = filters.name.trim();
    if (nameFilter === untracked(this.nameFilter)) {
      return;
    }

    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { q: nameFilter || null, page: 1 },
      queryParamsHandling: 'merge',
    });
  }

  onClearFilters(): void {
    if (!untracked(this.nameFilter)) {
      return;
    }

    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { q: null, page: 1 },
      queryParamsHandling: 'merge',
    });
  }
}

import { Component, inject, untracked } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Store } from '@ngrx/store';
import type { PaginatorState } from 'primeng/paginator';
import type { TablePageEvent } from 'primeng/table';

import { PaginationService } from '../../../../shared/utils/pagination.service';
import { DEFAULT_PAGE_SIZE_OPTIONS } from '../../../../shared/models/pagination';
import { productsListSelectors } from '../../store/products-list/products-list.selectors';
import type { Product } from '../../models/product.entity';
import { ProductHeaderComponent } from '../../components/product-header/product-header.component';
import {
  ProductsFilterPanelComponent,
  type ProductsListFilters,
} from '../../components/products-filter-panel/products-filter-panel.component';
import { ProductListComponent } from '../../components/product-list/product-list.component';
import {
  ProductsBreadcrumbComponent,
  type ProductsBreadcrumbItem,
} from '../../components/products-breadcrumb/products-breadcrumb.component';

/**
 * Smart page (container) for the products list. It owns only:
 * - the NgRx state mapping (selectors → signals),
 * - the URL write adapter (`page` / `pageSize` / `name` query params via merge),
 * - presentation glue (scroll behavior, page navigation).
 * The URL *read* side lives in the `store/products-list-url` effects
 * (NgRx Router Store); all business logic lives in the
 * `store/products-list` state module, including error presentation
 * (global `AppErrorEffects` toast).
 */
@Component({
  selector: 'app-products-page',
  standalone: true,
  imports: [
    ProductHeaderComponent,
    ProductsFilterPanelComponent,
    ProductListComponent,
    ProductsBreadcrumbComponent,
  ],
  templateUrl: './products-page.component.html',
})
export class ProductsPageComponent {
  readonly pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS;
  readonly breadcrumbItems: ProductsBreadcrumbItem[] = [{ label: 'Products' }];

  private readonly store = inject(Store);
  private readonly pagination = inject(PaginationService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  // --- Products list store (URL-backed paging + name filter) ---
  readonly products = this.store.selectSignal(productsListSelectors.selectProducts);
  readonly paging = this.store.selectSignal(productsListSelectors.selectPaging);
  readonly listLoading = this.store.selectSignal(productsListSelectors.selectIsLoading);
  readonly pageIndex = this.store.selectSignal(productsListSelectors.selectPageIndex);
  readonly pageSize = this.store.selectSignal(productsListSelectors.selectPageSize);
  readonly nameFilter = this.store.selectSignal(productsListSelectors.selectNameFilter);
  readonly first = this.store.selectSignal(productsListSelectors.selectFirst);

  goToCreate(): void {
    void this.router.navigate(['new'], { relativeTo: this.route.parent });
  }

  goToDetails(product: Product): void {
    void this.router.navigate([product.id], { relativeTo: this.route.parent });
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

  onFiltersChange(filters: ProductsListFilters): void {
    const nameFilter = filters.name.trim();
    if (nameFilter === untracked(this.nameFilter)) {
      return;
    }

    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { name: nameFilter || null, page: 1 },
      queryParamsHandling: 'merge',
    });
  }

  onClearFilters(): void {
    if (!untracked(this.nameFilter)) {
      return;
    }

    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { name: null, page: 1 },
      queryParamsHandling: 'merge',
    });
  }
}

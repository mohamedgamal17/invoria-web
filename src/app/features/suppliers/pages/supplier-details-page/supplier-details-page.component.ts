import { Component, computed, effect, inject, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';

import { Store } from '@ngrx/store';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';

import type { PurchaseOrdersListFilters } from '../../../procurement/components/purchase-orders-filter-panel/purchase-orders-filter-panel.component';
import type { PurchaseOrder } from '../../../procurement/models/purchase-order.entity';
import { type PaginatorPageEvent } from '../../../../shared/models/pagination';
import { PaginationService } from '../../../../shared/utils/pagination.service';
import { UrlStateService } from '../../../../shared/utils/url-state.service';
import { SupplierDetailsProfileComponent } from '../../components/supplier-details-profile/supplier-details-profile.component';
import { SupplierDetailsPurchaseOrdersTabComponent } from '../../components/supplier-details-purchase-orders-tab/supplier-details-purchase-orders-tab.component';
import { SupplierDetailsToolbarComponent } from '../../components/supplier-details-toolbar/supplier-details-toolbar.component';
import { SUPPLIER_DETAILS_ACTIONS } from '../../store/supplier-details/supplier-details.actions';
import { SupplierDetailsTab } from '../../store/supplier-details/supplier-details.reducer';
import { supplierDetailsSelectors } from '../../store/supplier-details/supplier-details.selectors';
import { toSupplierDetailsTab } from '../../utils/supplier-details-tab';
import { SUPPLIER_PURCHASE_ORDERS_ACTIONS } from '../../store/supplier-details-purchase-orders/supplier-details-purchase-orders.actions';
import { supplierPurchaseOrdersSelectors } from '../../store/supplier-details-purchase-orders/supplier-details-purchase-orders.selectors';

/**
 * Smart page (container) for supplier details. It owns only:
 * - the NgRx state mapping (selectors → signals),
 * - the URL write adapter (`tab` / `page` / `rows` query params via `replaceUrl`),
 * - presentation glue (scroll behavior, page navigation).
 * The URL *read* side lives in the `store/supplier-details-url` effects
 * (NgRx Router Store); all business logic lives in the
 * `store/supplier-details` and `store/supplier-details-purchase-orders`
 * state modules.
 */
@Component({
  selector: 'app-supplier-details-page',
  standalone: true,
  imports: [
    ButtonModule,
    CardModule,
    SkeletonModule,
    ToastModule,
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
    SupplierDetailsToolbarComponent,
    SupplierDetailsProfileComponent,
    SupplierDetailsPurchaseOrdersTabComponent,
  ],
  templateUrl: './supplier-details-page.component.html',
})
export class SupplierDetailsPageComponent {
  readonly tabs = SupplierDetailsTab;
  private readonly store = inject(Store);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly pagination = inject(PaginationService);
  private readonly urlState = inject(UrlStateService);

  // --- Details store (supplier + activeTab) ---
  readonly supplier = this.store.selectSignal(supplierDetailsSelectors.selectSupplier);
  readonly loading = this.store.selectSignal(supplierDetailsSelectors.selectIsLoading);
  readonly error = this.store.selectSignal(supplierDetailsSelectors.selectError);
  readonly activeTab = this.store.selectSignal(supplierDetailsSelectors.selectActiveTab);

  // --- Purchase orders store (URL-backed paging + current api page) ---
  readonly purchaseOrders = this.store.selectSignal(
    supplierPurchaseOrdersSelectors.selectPurchaseOrders,
  );
  readonly paging = this.store.selectSignal(supplierPurchaseOrdersSelectors.selectPaging);
  readonly first = this.store.selectSignal(supplierPurchaseOrdersSelectors.selectFirst);
  readonly pageSize = this.store.selectSignal(supplierPurchaseOrdersSelectors.selectPageSize);
  readonly pageIndex = this.store.selectSignal(supplierPurchaseOrdersSelectors.selectPageIndex);
  readonly purchaseOrdersLoading = this.store.selectSignal(
    supplierPurchaseOrdersSelectors.selectIsLoading,
  );
  readonly filters = this.store.selectSignal(supplierPurchaseOrdersSelectors.selectFilters);
  readonly purchaseNumber = computed(() => this.filters().purchaseNumber);
  readonly statusFilter = computed(() => this.filters().status);

  private readonly supplierId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id') ?? '')),
    { initialValue: this.route.snapshot.paramMap.get('id') ?? '' },
  );

  constructor() {
    // Trigger the details state module whenever the `:id` param changes.
    effect(() => {
      const supplierId = this.supplierId();
      if (!supplierId) {
        return;
      }
      untracked(() => this.store.dispatch(SUPPLIER_DETAILS_ACTIONS.loadSupplier({ supplierId })));
    });
  }

  backToList(): void {
    void this.router.navigate(['/suppliers']);
  }

  goToEdit(): void {
    void this.router.navigate(['edit'], { relativeTo: this.route });
  }

  retry(): void {
    const supplierId = untracked(this.supplierId);
    if (!supplierId) {
      return;
    }
    this.store.dispatch(SUPPLIER_DETAILS_ACTIONS.loadSupplier({ supplierId }));
  }

  onTabChange(value: string | number | undefined): void {
    if (value === undefined || value === null) {
      return;
    }
    const next = toSupplierDetailsTab(value);
    if (next === null) {
      return;
    }
    this.store.dispatch(SUPPLIER_DETAILS_ACTIONS.setActiveTab({ activeTab: next }));
    if (next === SupplierDetailsTab.PurchaseOrders) {
      this.store.dispatch(SUPPLIER_PURCHASE_ORDERS_ACTIONS.purchaseOrdersTabOpened());
    }
    this.replaceUrlQuery(next);
  }

  onPurchaseOrdersPageChange(event: PaginatorPageEvent): void {
    const { pageIndex: newPageIndex, pageSize: rows } = this.pagination.pageIndexFromEvent(
      event,
      untracked(this.pageSize),
    );
    // Presentation glue only: page navigation scrolls to top; the state (reducer)
    // decides whether the change is real and warrants an API call.
    const isManualPageChange = newPageIndex !== untracked(this.pageIndex);
    this.store.dispatch(
      SUPPLIER_PURCHASE_ORDERS_ACTIONS.pageChange({ pageIndex: newPageIndex, pageSize: rows }),
    );
    if (isManualPageChange) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    this.replaceUrlQuery(untracked(this.activeTab), newPageIndex, rows);
  }

  onPurchaseOrdersFiltersChange(filters: PurchaseOrdersListFilters): void {
    this.store.dispatch(SUPPLIER_PURCHASE_ORDERS_ACTIONS.filtersChange({ filters }));
  }

  onPurchaseOrdersFiltersClear(): void {
    this.store.dispatch(SUPPLIER_PURCHASE_ORDERS_ACTIONS.filtersClear());
  }

  goToPurchaseOrderDetails(purchaseOrder: PurchaseOrder): void {
    void this.router.navigate(['/procurement', purchaseOrder.id]);
  }

  private replaceUrlQuery(
    tabValue: SupplierDetailsTab,
    pageIndex = untracked(this.pageIndex),
    pageSize = untracked(this.pageSize),
  ): void {
    void this.urlState.replaceQueryParams(this.route, {
      tab: tabValue,
      page: pageIndex,
      rows: pageSize,
    });
  }
}

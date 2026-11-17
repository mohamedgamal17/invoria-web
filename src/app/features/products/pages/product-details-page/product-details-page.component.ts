import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  untracked,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { Store } from '@ngrx/store';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';

import { LOAD_STATUS } from '../../../../shared/models/load-status';
import { PaginationService } from '../../../../shared/utils/pagination.service';
import { UrlStateService } from '../../../../shared/utils/url-state.service';
import {
  DEFAULT_PAGE_SIZE_OPTIONS,
  type PaginatorPageEvent,
} from '../../../../shared/models/pagination';
import { ConfirmDialogService } from '../../../../shared/ui/confirm-dialog/confirm-dialog.service';
import { DetailsToolbarComponent } from '../../../../shared/ui/details-toolbar/details-toolbar.component';
import { DetailsSkeletonComponent } from '../../../../shared/ui/details-skeleton/details-skeleton.component';
import { ErrorCardComponent } from '../../../../shared/ui/error-card/error-card.component';
import { ProductsBreadcrumbComponent } from '../../components/products-breadcrumb/products-breadcrumb.component';
import { ProductDetailsInfoPanelComponent } from '../../components/product-details-info-panel/product-details-info-panel.component';
import { ProductDetailsOrdersPanelComponent } from '../../components/product-details-orders-panel/product-details-orders-panel.component';
import { ProductBatchesPanelComponent } from '../../../inventory/components/product-batches-panel.component';
import type { SaveBatchEvent } from '../../../inventory/models/save-batch.event';
import type { Product } from '../../models/product.entity';
import { productsMutationsFeature } from '../../store/products-mutations/products-mutations.reducer';
import { PRODUCT_MUTATIONS_ACTIONS } from '../../store/products-mutations/products-mutations.actions';
import { PRODUCT_DETAILS_ACTIONS } from '../../store/product-details/product-details.actions';
import { ProductDetailsTab } from '../../store/product-details/product-details.reducer';
import { productDetailsSelectors } from '../../store/product-details/product-details.selectors';
import { PRODUCT_BATCHES_ACTIONS } from '../../store/product-details-batches/product-details-batches.actions';
import { productBatchesSelectors } from '../../store/product-details-batches/product-details-batches.selectors';
import { PRODUCT_ORDERS_ACTIONS } from '../../store/product-details-orders/product-details-orders.actions';
import { productOrdersSelectors } from '../../store/product-details-orders/product-details-orders.selectors';
import { parseStringEnumTab } from '../../../../shared/navigation/query-param-parsers';
import type { ProductOrderRowSummary } from '../../models/product-order-summary';

/**
 * Smart page (container) for product details. It owns only:
 * - the NgRx state mapping (selectors → signals),
 * - the URL write adapter (`tab` / `page` / `pageSize` query params via `replaceUrl`),
 * - presentation glue (scroll behavior, navigation, delete confirmation dialog).
 * The URL *read* side lives in the `store/product-details-url` effects
 * (NgRx Router Store); all API calls live in the `store/product-details`,
 * `store/product-details-batches` and `store/products-mutations` state modules.
 */
@Component({
  selector: 'app-product-details-page',
  standalone: true,
  imports: [
    ButtonModule,
    CardModule,
    ToastModule,
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
    ProductsBreadcrumbComponent,
    DetailsToolbarComponent,
    DetailsSkeletonComponent,
    ErrorCardComponent,
    ProductDetailsInfoPanelComponent,
    ProductBatchesPanelComponent,
    ProductDetailsOrdersPanelComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-details-page.component.html',
})
export class ProductDetailsPageComponent {
  readonly tabs = ProductDetailsTab;
  private readonly store = inject(Store);
  private readonly pagination = inject(PaginationService);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly urlState = inject(UrlStateService);

  readonly pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS;

  // --- Details store (product + activeTab) ---------------------------------
  readonly product = this.store.selectSignal(productDetailsSelectors.selectProduct);
  readonly loading = this.store.selectSignal(productDetailsSelectors.selectIsLoading);
  readonly error = this.store.selectSignal(productDetailsSelectors.selectError);
  readonly activeTab = this.store.selectSignal(productDetailsSelectors.selectActiveTab);

  // --- Mutations store (delete request) ------------------------------------
  private readonly deleteRequest = this.store.selectSignal(
    productsMutationsFeature.selectDeleteRequest,
  );
  readonly deleting = computed(() => this.deleteRequest().status === LOAD_STATUS.Loading);

  // --- Batches store (URL-backed paging + current api page + mutations) ----
  readonly batches = this.store.selectSignal(productBatchesSelectors.selectBatches);
  readonly batchesLoading = this.store.selectSignal(productBatchesSelectors.selectIsLoading);
  readonly batchesSaving = this.store.selectSignal(productBatchesSelectors.selectIsSaving);
  readonly batchesSaveStatus = this.store.selectSignal(productBatchesSelectors.selectSaveStatus);
  readonly batchesPaging = this.store.selectSignal(productBatchesSelectors.selectPaging);
  readonly first = this.store.selectSignal(productBatchesSelectors.selectFirst);
  readonly pageSize = this.store.selectSignal(productBatchesSelectors.selectPageSize);
  readonly pageIndex = this.store.selectSignal(productBatchesSelectors.selectPageIndex);

  readonly totalRecords = computed(() => this.batchesPaging().totalCount);

  // --- Orders store (lazy tab gate + product-level order summaries) --------
  readonly productOrderRows = this.store.selectSignal(productOrdersSelectors.selectRows);
  readonly productOrdersAggregate = this.store.selectSignal(productOrdersSelectors.selectAggregate);
  readonly productOrdersLoading = this.store.selectSignal(productOrdersSelectors.selectIsLoading);

  readonly breadcrumbItems = computed(() => {
    const product = this.product();
    const label = product ? product.name.trim() || 'Product' : 'Product';
    return [{ label: 'Products', routerLink: ['/products'] as string[] }, { label }];
  });

  private readonly productId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id') ?? '')),
    { initialValue: this.route.snapshot.paramMap.get('id') ?? '' },
  );

  constructor() {
    // Trigger the details state module whenever the `:id` param changes.
    effect(() => {
      const id = this.productId();
      if (!id) {
        return;
      }
      untracked(() => this.store.dispatch(PRODUCT_DETAILS_ACTIONS.loadProduct({ productId: id })));
    });
  }

  backToList(): void {
    void this.router.navigate(['/products']);
  }

  goToEdit(): void {
    void this.router.navigate(['edit'], { relativeTo: this.route });
  }

  retry(): void {
    const id = untracked(this.productId);
    if (!id) {
      return;
    }
    this.store.dispatch(PRODUCT_DETAILS_ACTIONS.loadProduct({ productId: id }));
  }

  onTabChange(value: string | number | undefined): void {
    if (value === undefined || value === null) {
      return;
    }
    const next = parseStringEnumTab(ProductDetailsTab, value);
    if (next === null) {
      return;
    }
    this.store.dispatch(PRODUCT_DETAILS_ACTIONS.setActiveTab({ activeTab: next }));
    if (next === ProductDetailsTab.Batches) {
      this.store.dispatch(PRODUCT_BATCHES_ACTIONS.batchesTabOpened());
    }
    if (next === ProductDetailsTab.Orders) {
      this.store.dispatch(PRODUCT_ORDERS_ACTIONS.ordersTabOpened());
    }
    this.replaceUrlQuery(next);
  }

  onBatchesPageChange(event: PaginatorPageEvent): void {
    const rows = this.pagination.normalizePageSize(event.rows ?? untracked(this.pageSize));
    const newPageIndex = event.page ?? Math.floor((event.first ?? 0) / Math.max(rows, 1));
    // Presentation glue only: page navigation scrolls to top; the state (reducer)
    // decides whether the change is real and warrants an API call.
    const isManualPageChange = newPageIndex !== untracked(this.pageIndex);
    this.store.dispatch(
      PRODUCT_BATCHES_ACTIONS.pageChange({ pageIndex: newPageIndex, pageSize: rows }),
    );
    if (isManualPageChange) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    this.replaceUrlQuery(untracked(this.activeTab), newPageIndex, rows);
  }

  onBatchesSave(event: SaveBatchEvent): void {
    if (event.batch === null) {
      this.store.dispatch(PRODUCT_BATCHES_ACTIONS.createBatch({ payload: event.payload }));
    } else {
      this.store.dispatch(
        PRODUCT_BATCHES_ACTIONS.updateBatch({ id: event.batch.id, payload: event.payload }),
      );
    }
  }

  onViewProductOrder(row: ProductOrderRowSummary): void {
    void this.router.navigate(['/orders', row.orderId]);
  }

  onReloadProductOrders(): void {
    this.store.dispatch(PRODUCT_ORDERS_ACTIONS.reloadOrders());
  }

  deleteProduct(): void {
    const product = this.product();
    if (!product || this.deleting()) {
      return;
    }
    this.confirmDialog
      .confirm({
        header: 'Delete Product',
        message: `Are you sure you want to delete "${product.name}"?`,
        severity: 'danger',
        acceptLabel: 'Delete',
      })
      .subscribe((accepted) => {
        if (accepted) {
          this.store.dispatch(PRODUCT_MUTATIONS_ACTIONS.deleteProduct({ id: product.id }));
        }
      });
  }

  private replaceUrlQuery(
    tabValue: ProductDetailsTab,
    pageIndex = untracked(this.pageIndex),
    pageSize = untracked(this.pageSize),
  ): void {
    // `page`/`pageSize` are only meaningful on the batches tab — keep other
    // tabs' URLs clean (mirror of the legacy `/products/:id/batches` redirect).
    const queryParams =
      tabValue === ProductDetailsTab.Batches
        ? { tab: tabValue, page: pageIndex + 1, pageSize }
        : { tab: tabValue };
    void this.urlState.replaceQueryParams(this.route, queryParams);
  }
}

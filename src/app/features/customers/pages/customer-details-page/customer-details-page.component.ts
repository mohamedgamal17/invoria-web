import { Component, computed, effect, inject, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';

import { Store } from '@ngrx/store';
import {ButtonModule} from 'primeng/button';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';

import type { OrdersListFilters } from '../../../orders/components/orders-filter-panel/orders-filter-panel.component';
import type { UiOrder } from '../../../orders/models/order-ui.model';
import { PaginationService } from '../../../../shared/utils/pagination.service';
import { type PaginatorPageEvent } from '../../../../shared/models/pagination';
import { UrlStateService } from '../../../../shared/utils/url-state.service';
import { CustomerDetailsOrdersTabComponent } from '../../components/customer-details-orders-tab/customer-details-orders-tab.component';
import { CustomerDetailsProfileComponent } from '../../components/customer-details-profile/customer-details-profile.component';
import { CustomerDetailsToolbarComponent } from '../../components/customer-details-toolbar/customer-details-toolbar.component';
import { CUSTOMER_DETAILS_ACTIONS } from '../../store/customer-details/customer-details.actions';
import { CustomerDetailsTab } from '../../store/customer-details/customer-details.reducer';
import { customerDetailsSelectors } from '../../store/customer-details/customer-details.selectors';
import { toCustomerDetailsTab } from '../../utils/customer-details-tab';
import { CUSTOMER_ORDERS_ACTIONS } from '../../store/customer-details-orders/customer-details-orders.actions';
import { customerOrdersSelectors } from '../../store/customer-details-orders/customer-details-orders.selectors';

/**
 * Smart page (container) for customer details. It owns only:
 * - the NgRx state mapping (selectors → signals),
 * - the URL write adapter (`tab` / `page` / `rows` query params via `replaceUrl`),
 * - presentation glue (scroll behavior, page navigation).
 * The URL *read* side lives in the `store/customer-details-url` effects
 * (NgRx Router Store); all business logic lives in the
 * `store/customer-details` and `store/customer-details-orders` state modules.
 */
@Component({
  selector: 'app-customer-details-page',
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
    CustomerDetailsToolbarComponent,
    CustomerDetailsProfileComponent,
    CustomerDetailsOrdersTabComponent
  ],
  templateUrl: './customer-details-page.component.html'
})
export class CustomerDetailsPageComponent {
  readonly tabs = CustomerDetailsTab;
  private readonly store = inject(Store);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly pagination = inject(PaginationService);
  private readonly urlState = inject(UrlStateService);

  // --- Details store (customer + activeTab) ---
  readonly customer = this.store.selectSignal(customerDetailsSelectors.selectCustomer);
  readonly loading = this.store.selectSignal(customerDetailsSelectors.selectIsLoading);
  readonly error = this.store.selectSignal(customerDetailsSelectors.selectError);
  readonly activeTab = this.store.selectSignal(customerDetailsSelectors.selectActiveTab);

  // --- Orders store (URL-backed paging + current api page) ---
  readonly orders = this.store.selectSignal(customerOrdersSelectors.selectOrders);
  readonly paging = this.store.selectSignal(customerOrdersSelectors.selectPaging);
  readonly first = this.store.selectSignal(customerOrdersSelectors.selectFirst);
  readonly pageSize = this.store.selectSignal(customerOrdersSelectors.selectPageSize);
  readonly pageIndex = this.store.selectSignal(customerOrdersSelectors.selectPageIndex);
  readonly ordersTabOpened = this.store.selectSignal(customerOrdersSelectors.selectOrdersTabOpened);
  readonly ordersLoading = this.store.selectSignal(customerOrdersSelectors.selectIsLoading);
  readonly filters = this.store.selectSignal(customerOrdersSelectors.selectFilters);
  readonly orderNumber = computed(() => this.filters().orderNumber);
  readonly orderStatusFilter = computed(() => this.filters().status);
  readonly paymentStatusFilter = computed(() => this.filters().paymentStatus);
  readonly paymentTypeFilter = computed(() => this.filters().paymentType);

  private readonly orderId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id') ?? '')),
    { initialValue: this.route.snapshot.paramMap.get('id') ?? '' }
  );

  constructor() {
    // Trigger the details state module whenever the `:id` param changes.
    effect(() => {
      const id = this.orderId();
      if (!id) {
        return;
      }
      untracked(() =>
        this.store.dispatch(CUSTOMER_DETAILS_ACTIONS.loadCustomer({ customerId: id }))
      );
    });
  }

  backToList(): void {
    void this.router.navigate(['/customers']);
  }

  goToEdit(): void {
    void this.router.navigate(['edit'], { relativeTo: this.route });
  }

  retry(): void {
    const id = untracked(this.orderId);
    if (!id) {
      return;
    }
    this.store.dispatch(CUSTOMER_DETAILS_ACTIONS.loadCustomer({ customerId: id }));
  }

  onTabChange(value: string | number | undefined): void {
    if (value === undefined || value === null) {
      return;
    }
    const next = toCustomerDetailsTab(value);
    if (next === null) {
      return;
    }
    this.store.dispatch(CUSTOMER_DETAILS_ACTIONS.setActiveTab({ activeTab: next }));
    if (next === CustomerDetailsTab.Orders) {
      this.store.dispatch(CUSTOMER_ORDERS_ACTIONS.ordersTabOpened());
    }
    this.replaceUrlQuery(next);
  }

  onOrdersPageChange(event: PaginatorPageEvent): void {
    const { pageIndex: newPageIndex, pageSize: rows } = this.pagination.pageIndexFromEvent(
      event,
      untracked(this.pageSize)
    );
    // Presentation glue only: page navigation scrolls to top; the state (reducer)
    // decides whether the change is real and warrants an API call.
    const isManualPageChange = newPageIndex !== untracked(this.pageIndex);
    this.store.dispatch(
      CUSTOMER_ORDERS_ACTIONS.pageChange({ pageIndex: newPageIndex, pageSize: rows })
    );
    if (isManualPageChange) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    this.replaceUrlQuery(untracked(this.activeTab), newPageIndex, rows);
  }

  onOrdersFiltersChange(filters: OrdersListFilters): void {
    this.store.dispatch(CUSTOMER_ORDERS_ACTIONS.filtersChange({ filters }));
  }

  onOrdersFiltersClear(): void {
    this.store.dispatch(CUSTOMER_ORDERS_ACTIONS.filtersClear());
  }

  goToOrderDetails(order: UiOrder): void {
    void this.router.navigate(['/orders', order.id]);
  }

  private replaceUrlQuery(
    tabValue: CustomerDetailsTab,
    pageIndex = untracked(this.pageIndex),
    pageSize = untracked(this.pageSize)
  ): void {
    void this.urlState.replaceQueryParams(this.route, {
      tab: tabValue,
      page: pageIndex,
      rows: pageSize
    });
  }
}

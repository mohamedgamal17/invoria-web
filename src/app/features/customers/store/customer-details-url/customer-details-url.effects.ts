import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store, type Action } from '@ngrx/store';
import { getRouterSelectors, routerNavigatedAction } from '@ngrx/router-store';
import { filter, map, mergeMap, of, withLatestFrom } from 'rxjs';

import type { Params } from '@angular/router';
import { PaginationService } from '../../../../shared/utils/pagination.service';
import { numberParamValue, scalarParamValue } from '../../../../shared/utils/url-query-params';
import { toCustomerDetailsTab } from '../../utils/customer-details-tab';
import { CUSTOMER_DETAILS_ACTIONS } from '../customer-details/customer-details.actions';
import { CustomerDetailsTab } from '../customer-details/customer-details.reducer';
import { customerDetailsSelectors } from '../customer-details/customer-details.selectors';
import { CUSTOMER_ORDERS_ACTIONS } from '../customer-details-orders/customer-details-orders.actions';

const { selectQueryParams, selectRouteParams } = getRouterSelectors();

/**
 * URL adapter: applies the `tab` / `page` / `rows` query params of the
 * customer details page into the feature state modules. The page component
 * observes nothing from the URL; the store reacts to router events instead.
 *
 * Triggers:
 * - `ROUTER_NAVIGATED` (any navigation while the details route is active —
 *   includes the `replaceUrl` writes the component performs itself; the
 *   reducers no-op identical values so those round-trips are harmless).
 * - `Load Customer Success` (a deep link `?tab=...`/`?page=...` arrives
 *   before the customer exists; this re-applies the URL once the customer
 *   context is in place).
 *
 * Defaults live in the parse helpers: missing/invalid `tab` keeps `profile`,
 * missing/invalid `page`/`rows` apply the defaults (`0` / `25`).
 */
@Injectable()
export class CustomerDetailsUrlEffects {
  private readonly actions$ = inject(Actions);
  private readonly store = inject(Store);
  private readonly pagination = inject(PaginationService);

  readonly applyUrlQuery$ = createEffect(() =>
    this.actions$.pipe(
      ofType(routerNavigatedAction, CUSTOMER_DETAILS_ACTIONS.loadCustomerSuccess),
      withLatestFrom(
        this.store.select(selectQueryParams),
        this.store.select(selectRouteParams),
        this.store.select(customerDetailsSelectors.selectCustomer),
        this.store.select(customerDetailsSelectors.selectIsLoading),
      ),
      filter(
        ([, queryParams, routeParams, customer, isLoading]) =>
          queryParams !== undefined &&
          routeParams !== undefined &&
          typeof routeParams['id'] === 'string' &&
          routeParams['id'].length > 0 &&
          customer !== null &&
          !isLoading &&
          customer.id === routeParams['id'],
      ),
      map(([, queryParams]) => this.actionsFromUrlQuery(queryParams as Params)),
      mergeMap((actions) => of(...actions)),
    ),
  );

  /** Builds the state actions for one URL query; reducers no-op identical values.
   *  Paging is applied BEFORE the tab gate: the `loadOrders` reducer stays idle
   *  while `ordersTabOpened` is false, so one URL batch funnels into exactly one
   *  fetch that already sees the settled paging values. */
  private actionsFromUrlQuery(queryParams: Params): Action[] {
    const tab = toCustomerDetailsTab(scalarParamValue(queryParams['tab']));
    const actions: Action[] = [
      // Absent/invalid params yield the helpers' defaults from the parse (`0` / default page size).
      CUSTOMER_ORDERS_ACTIONS.setPagingFromUrl({
        pageIndex: this.pagination.parseNonNegativeInt(numberParamValue(queryParams['page'])),
        pageSize: this.pagination.normalizePageSize(numberParamValue(queryParams['rows'])),
      }),
    ];
    if (tab !== null) {
      actions.push(CUSTOMER_DETAILS_ACTIONS.setActiveTab({ activeTab: tab }));
      if (tab === CustomerDetailsTab.Orders) {
        actions.push(CUSTOMER_ORDERS_ACTIONS.ordersTabOpened());
      }
    }
    return actions;
  }
}

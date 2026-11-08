import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store, type Action } from '@ngrx/store';
import { getRouterSelectors, routerNavigatedAction } from '@ngrx/router-store';
import { filter, map, mergeMap, of, withLatestFrom } from 'rxjs';
import type { Params } from '@angular/router';

import { scalarParamValue } from '../../../../shared/utils/url-query-params';
import { toOrderDetailsTab } from '../../utils/order-details-tab';
import { ORDER_DETAILS_ACTIONS } from '../order-details/order-details.actions';
import { orderDetailsSelectors } from '../order-details/order-details.selectors';

const { selectQueryParams, selectRouteParams } = getRouterSelectors();

/**
 * URL adapter: applies the `tab` slug query param of the order details route
 * into the details slice. The page component observes nothing from the URL;
 * the store reacts to router events instead.
 *
 * Triggers:
 * - `ROUTER_NAVIGATED` (any navigation while the details route is active —
 *   includes the `replaceUrl` writes the component performs itself; the
 *   reducer no-ops identical values so those round-trips are harmless).
 * - `Load Order Success` (a deep link `?tab=...` arrives before the order
 *   exists; this re-applies the URL once the order context is in place).
 *
 * Defaults live in the parse helper: missing/invalid `tab` keeps the current
 * tab (identical-tab dispatches are no-ops in the reducer).
 */
@Injectable()
export class OrderDetailsUrlEffects {
  private readonly actions$ = inject(Actions);
  private readonly store = inject(Store);

  readonly applyUrlQuery$ = createEffect(() =>
    this.actions$.pipe(
      ofType(routerNavigatedAction, ORDER_DETAILS_ACTIONS.loadOrderSuccess),
      withLatestFrom(
        this.store.select(selectQueryParams),
        this.store.select(selectRouteParams),
        this.store.select(orderDetailsSelectors.selectOrder),
        this.store.select(orderDetailsSelectors.selectIsLoading),
      ),
      filter(
        ([, queryParams, routeParams, order, isLoading]) =>
          queryParams !== undefined &&
          routeParams !== undefined &&
          typeof routeParams['id'] === 'string' &&
          routeParams['id'].length > 0 &&
          order !== null &&
          !isLoading &&
          order.id === routeParams['id'],
      ),
      map(([, queryParams]) => this.actionsFromUrlQuery(queryParams as Params)),
      mergeMap((actions) => of(...actions)),
    ),
  );

  /** Builds the state actions for one URL query; reducers no-op identical values. */
  private actionsFromUrlQuery(queryParams: Params): Action[] {
    const actions: Action[] = [];
    const tab = toOrderDetailsTab(scalarParamValue(queryParams['tab']));
    if (tab !== null) {
      actions.push(ORDER_DETAILS_ACTIONS.setActiveTab({ activeTab: tab }));
    }
    return actions;
  }
}

import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store, type Action } from '@ngrx/store';
import { getRouterSelectors, routerNavigatedAction } from '@ngrx/router-store';
import { filter, map, mergeMap, of, withLatestFrom } from 'rxjs';
import type { Params } from '@angular/router';

import { scalarParamValue } from '../../../../shared/utils/url-query-params';
import { toPurchaseOrderDetailsTab } from '../../utils/purchase-order-details-tab';
import { PURCHASE_ORDER_DETAILS_ACTIONS } from '../purchase-order-details/purchase-order-details.actions';
import { purchaseOrderDetailsSelectors } from '../purchase-order-details/purchase-order-details.selectors';

const { selectQueryParams, selectRouteParams } = getRouterSelectors();

/**
 * URL adapter: applies the `tab` query param of the purchase order details
 * route into the details state module. The page component observes nothing
 * from the URL; the store reacts to router events instead.
 *
 * Triggers:
 * - `ROUTER_NAVIGATED` (any navigation while the details route is active —
 *   includes the `replaceUrl` writes the component performs itself; the
 *   reducer no-ops identical values so those round-trips are harmless).
 * - `Load Purchase Order Success` (a deep link `?tab=...` arrives before the
 *   purchase order exists; this re-applies the URL once the entity context is
 *   in place).
 *
 * Defaults live in the parse helper: a missing/invalid `tab` keeps the
 * current tab.
 */
@Injectable()
export class PurchaseOrderDetailsUrlEffects {
  private readonly actions$ = inject(Actions);
  private readonly store = inject(Store);

  readonly applyUrlQuery$ = createEffect(() =>
    this.actions$.pipe(
      ofType(routerNavigatedAction, PURCHASE_ORDER_DETAILS_ACTIONS.loadPurchaseOrderSuccess),
      withLatestFrom(
        this.store.select(selectQueryParams),
        this.store.select(selectRouteParams),
        this.store.select(purchaseOrderDetailsSelectors.selectPurchaseOrder),
        this.store.select(purchaseOrderDetailsSelectors.selectIsLoading),
      ),
      filter(
        ([, queryParams, routeParams, purchaseOrder, isLoading]) =>
          queryParams !== undefined &&
          routeParams !== undefined &&
          typeof routeParams['id'] === 'string' &&
          routeParams['id'].length > 0 &&
          purchaseOrder !== null &&
          !isLoading &&
          purchaseOrder.id === routeParams['id'],
      ),
      map(([, queryParams]) => this.actionsFromUrlQuery(queryParams as Params)),
      mergeMap((actions) => of(...actions)),
    ),
  );

  /** Builds the state actions for one URL query; reducers no-op identical values. */
  private actionsFromUrlQuery(queryParams: Params): Action[] {
    const tab = toPurchaseOrderDetailsTab(scalarParamValue(queryParams['tab']));
    const actions: Action[] = [];
    if (tab !== null) {
      actions.push(PURCHASE_ORDER_DETAILS_ACTIONS.setActiveTab({ activeTab: tab }));
    }
    return actions;
  }
}

import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { getRouterSelectors, routerNavigatedAction } from '@ngrx/router-store';
import { filter, map, withLatestFrom } from 'rxjs';
import type { Params } from '@angular/router';

import { scalarParamValue } from '../../../../shared/utils/url-query-params';
import { toPayableDetailsTab } from '../../utils/payable-details-tab';
import { PAYABLE_DETAILS_ACTIONS } from '../payable-details/payable-details.actions';
import { payableDetailsSelectors } from '../payable-details/payable-details.selectors';
import { PayableDetailsTab } from '../payable-details/payable-details.reducer';

const { selectQueryParams, selectRouteParams } = getRouterSelectors();

/**
 * URL adapter: applies the `tab` query param of the payable details route
 * into the details state module. The page component observes nothing from
 * the URL; the store reacts to router events instead.
 *
 * Triggers:
 * - `ROUTER_NAVIGATED` (any navigation while the details route is active —
 *   includes the `replaceUrl` writes the component performs itself; the
 *   reducer no-ops identical values so those round-trips are harmless).
 * - `Load Payable Success` (a deep link `?tab=...` arrives before the
 *   payable exists; this re-applies the URL once the payable context is in
 *   place).
 *
 * A missing/invalid `tab` applies the default tab (`overview`): the store
 * survives navigation between two payables (same route instance), and the
 * legacy page behavior resets the tab on every payable change.
 */
@Injectable()
export class PayableDetailsUrlEffects {
  private readonly actions$ = inject(Actions);
  private readonly store = inject(Store);

  readonly applyUrlQuery$ = createEffect(() =>
    this.actions$.pipe(
      ofType(routerNavigatedAction, PAYABLE_DETAILS_ACTIONS.loadPayableSuccess),
      withLatestFrom(
        this.store.select(selectQueryParams),
        this.store.select(selectRouteParams),
        this.store.select(payableDetailsSelectors.selectPayable),
        this.store.select(payableDetailsSelectors.selectIsLoading),
      ),
      filter(
        ([, queryParams, routeParams, payable, isLoading]) =>
          queryParams !== undefined &&
          routeParams !== undefined &&
          typeof routeParams['id'] === 'string' &&
          routeParams['id'].length > 0 &&
          payable !== null &&
          !isLoading &&
          payable.id === routeParams['id'],
      ),
      map(([, queryParams]) => {
        const tab = toPayableDetailsTab(scalarParamValue((queryParams as Params)['tab']));
        return PAYABLE_DETAILS_ACTIONS.setActiveTab({
          activeTab: tab ?? PayableDetailsTab.Overview,
        });
      }),
    ),
  );
}

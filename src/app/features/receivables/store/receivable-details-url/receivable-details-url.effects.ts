import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { getRouterSelectors, routerNavigatedAction } from '@ngrx/router-store';
import { filter, map, withLatestFrom } from 'rxjs';
import type { Params } from '@angular/router';

import { scalarParamValue } from '../../../../shared/utils/url-query-params';
import { toReceivableDetailsTab } from '../../utils/receivable-details-tab';
import { RECEIVABLE_DETAILS_ACTIONS } from '../receivable-details/receivable-details.actions';
import { receivableDetailsSelectors } from '../receivable-details/receivable-details.selectors';
import { ReceivableDetailsTab } from '../receivable-details/receivable-details.reducer';

const { selectQueryParams, selectRouteParams } = getRouterSelectors();

/**
 * URL adapter: applies the `tab` query param of the receivable details route
 * into the details state module. The page component observes nothing from
 * the URL; the store reacts to router events instead.
 *
 * Triggers:
 * - `ROUTER_NAVIGATED` (any navigation while the details route is active —
 *   includes the `replaceUrl` writes the component performs itself; the
 *   reducer no-ops identical values so those round-trips are harmless).
 * - `Load Receivable Success` (a deep link `?tab=...` arrives before the
 *   receivable exists; this re-applies the URL once the receivable context is
 *   in place).
 *
 * A missing/invalid `tab` applies the default tab (`overview`): the store
 * survives navigation between two receivables (same route instance), and the
 * legacy page behavior resets the tab on every receivable change.
 */
@Injectable()
export class ReceivableDetailsUrlEffects {
  private readonly actions$ = inject(Actions);
  private readonly store = inject(Store);

  readonly applyUrlQuery$ = createEffect(() =>
    this.actions$.pipe(
      ofType(routerNavigatedAction, RECEIVABLE_DETAILS_ACTIONS.loadReceivableSuccess),
      withLatestFrom(
        this.store.select(selectQueryParams),
        this.store.select(selectRouteParams),
        this.store.select(receivableDetailsSelectors.selectReceivable),
        this.store.select(receivableDetailsSelectors.selectIsLoading),
      ),
      filter(
        ([, queryParams, routeParams, receivable, isLoading]) =>
          queryParams !== undefined &&
          routeParams !== undefined &&
          typeof routeParams['id'] === 'string' &&
          routeParams['id'].length > 0 &&
          receivable !== null &&
          !isLoading &&
          receivable.id === routeParams['id'],
      ),
      map(([, queryParams]) => {
        const tab = toReceivableDetailsTab(scalarParamValue((queryParams as Params)['tab']));
        return RECEIVABLE_DETAILS_ACTIONS.setActiveTab({
          activeTab: tab ?? ReceivableDetailsTab.Overview,
        });
      }),
    ),
  );
}

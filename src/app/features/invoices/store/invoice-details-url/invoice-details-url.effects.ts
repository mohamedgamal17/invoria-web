import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store, type Action } from '@ngrx/store';
import { getRouterSelectors, routerNavigatedAction } from '@ngrx/router-store';
import { filter, map, mergeMap, of, withLatestFrom } from 'rxjs';
import type { Params } from '@angular/router';

import { scalarParamValue } from '../../../../shared/utils/url-query-params';
import { toInvoiceDetailsTab } from '../../utils/invoice-details-tab';
import { INVOICE_DETAILS_ACTIONS } from '../invoice-details/invoice-details.actions';
import { invoiceDetailsSelectors } from '../invoice-details/invoice-details.selectors';

const { selectQueryParams, selectRouteParams } = getRouterSelectors();

/**
 * URL adapter: applies the `tab` slug query param of the invoice details route
 * into the details slice. The page component observes nothing from the URL;
 * the store reacts to router events instead.
 *
 * Triggers:
 * - `ROUTER_NAVIGATED` (any navigation while the details route is active —
 *   includes the `replaceUrl` writes the component performs itself; the
 *   reducer no-ops identical values so those round-trips are harmless).
 * - `Load Invoice Success` (a deep link `?tab=...` arrives before the invoice
 *   exists; this re-applies the URL once the invoice context is in place).
 *
 * Defaults live in the parse helper: missing/invalid `tab` keeps the current
 * tab (identical-tab dispatches are no-ops in the reducer).
 */
@Injectable()
export class InvoiceDetailsUrlEffects {
  private readonly actions$ = inject(Actions);
  private readonly store = inject(Store);

  readonly applyUrlQuery$ = createEffect(() =>
    this.actions$.pipe(
      ofType(routerNavigatedAction, INVOICE_DETAILS_ACTIONS.loadInvoiceSuccess),
      withLatestFrom(
        this.store.select(selectQueryParams),
        this.store.select(selectRouteParams),
        this.store.select(invoiceDetailsSelectors.selectInvoice),
        this.store.select(invoiceDetailsSelectors.selectIsLoading),
      ),
      filter(
        ([, queryParams, routeParams, invoice, isLoading]) =>
          queryParams !== undefined &&
          routeParams !== undefined &&
          typeof routeParams['id'] === 'string' &&
          routeParams['id'].length > 0 &&
          invoice !== null &&
          !isLoading &&
          invoice.id === routeParams['id'],
      ),
      map(([, queryParams]) => this.actionsFromUrlQuery(queryParams as Params)),
      mergeMap((actions) => of(...actions)),
    ),
  );

  /** Builds the state actions for one URL query; reducers no-op identical values. */
  private actionsFromUrlQuery(queryParams: Params): Action[] {
    const actions: Action[] = [];
    const tab = toInvoiceDetailsTab(scalarParamValue(queryParams['tab']));
    if (tab !== null) {
      actions.push(INVOICE_DETAILS_ACTIONS.setActiveTab({ activeTab: tab }));
    }
    return actions;
  }
}

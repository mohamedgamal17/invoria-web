import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { getRouterSelectors, routerNavigatedAction } from '@ngrx/router-store';
import { filter, map, withLatestFrom } from 'rxjs';
import type { Params } from '@angular/router';

import { numberParamValue, scalarParamValue } from '../../../../shared/utils/url-query-params';
import { PaginationService } from '../../../../shared/utils/pagination.service';
import { INVOICES_LIST_ACTIONS } from '../invoices-list/invoices-list.actions';

const { selectQueryParams, selectUrl } = getRouterSelectors();

/** Matches `/invoices` only — never `/invoices/:id`. */
const LIST_ROUTE_URL_PATTERN = /^\/invoices(?:[?#]|$)/;

/** Normalizes the 1-based `page` query param to a 0-based page index; invalid values fall back to `0`. */
function pageIndexFromPageParam(raw: number | null): number {
  const parsed = raw === null ? 0 : raw;
  return Number.isFinite(parsed) && parsed >= 1 && Number.isInteger(parsed) ? parsed - 1 : 0;
}

/** Normalized (trimmed) entity filter from a query param; missing values default to `''`. */
function filterParamValue(raw: unknown): string {
  return scalarParamValue(raw)?.toString().trim() ?? '';
}

/**
 * URL adapter: applies the `page` (1-based) / `pageSize` / `customerId` /
 * `orderId` query params of the invoices list route into the list state slice.
 * The page component observes nothing from the URL; the store reacts to router
 * events instead, so the paginator buttons and deep links drive the list the
 * same way.
 *
 * Triggers:
 * - `ROUTER_NAVIGATED` for navigations landing on `/invoices` (any other
 *   route — including invoice details — is gated out by the URL pattern).
 *
 * The component's own `merge` query writes round-trip through here too; the
 * reducer no-ops identical values, so those are harmless.
 *
 * Defaults live in the parse helpers: missing/invalid `page` applies index
 * `0`, `pageSize` is validated against the shared page-size options, the
 * entity filters are trimmed (default `''`).
 */
@Injectable()
export class InvoicesListUrlEffects {
  private readonly actions$ = inject(Actions);
  private readonly store = inject(Store);
  private readonly pagination = inject(PaginationService);

  readonly applyUrlQuery$ = createEffect(() =>
    this.actions$.pipe(
      ofType(routerNavigatedAction),
      withLatestFrom(
        this.store.select(selectUrl),
        this.store.select(selectQueryParams),
      ),
      filter(([, url]) => LIST_ROUTE_URL_PATTERN.test(url ?? '')),
      map(([, , queryParams]) =>
        INVOICES_LIST_ACTIONS.setQueryFromUrl({
          pageIndex: pageIndexFromPageParam(numberParamValue((queryParams as Params)['page'])),
          pageSize: this.pagination.pageSizeFromQuery(
            numberParamValue((queryParams as Params)['pageSize']),
          ),
          customerIdFilter: filterParamValue((queryParams as Params)['customerId']),
          orderIdFilter: filterParamValue((queryParams as Params)['orderId']),
        }),
      ),
    ),
  );
}

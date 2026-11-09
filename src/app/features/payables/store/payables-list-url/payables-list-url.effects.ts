import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { getRouterSelectors, routerNavigatedAction } from '@ngrx/router-store';
import { filter, map, withLatestFrom } from 'rxjs';
import type { Params } from '@angular/router';

import { numberParamValue, scalarParamValue } from '../../../../shared/utils/url-query-params';
import { PaginationService } from '../../../../shared/utils/pagination.service';
import { PAYABLES_LIST_ACTIONS } from '../payables-list/payables-list.actions';

const { selectQueryParams, selectUrl } = getRouterSelectors();

/** Matches `/payables` only — never `/payables/:id` or any deeper route. */
const LIST_ROUTE_URL_PATTERN = /^\/payables(?:[?#]|$)/;

/** Normalizes the 1-based `page` query param to a 0-based page index; invalid values fall back to `0`. */
function pageIndexFromPageParam(raw: number | null): number {
  const parsed = raw === null ? 0 : raw;
  return Number.isFinite(parsed) && parsed >= 1 && Number.isInteger(parsed) ? parsed - 1 : 0;
}

/** Parses the `isPaid` tri-state query param (`true`/`false`, anything else → `null`). */
function isPaidParamValue(raw: string | number | null): boolean | null {
  if (raw === null) {
    return null;
  }
  if (raw === 'true') {
    return true;
  }
  if (raw === 'false') {
    return false;
  }
  return null;
}

/**
 * URL adapter: applies the `page` (1-based) / `pageSize` / `supplierId` /
 * `sourceId` / `isPaid` query params of the payables list route into the list
 * state slice. The page component observes nothing from the URL; the store
 * reacts to router events instead, so the paginator, filter panel and deep
 * links drive the list the same way.
 *
 * Triggers:
 * - `ROUTER_NAVIGATED` for navigations landing on `/payables` (any other
 *   route — including payable details — is gated out by the URL pattern).
 *
 * The component's own `merge` query writes round-trip through here too; the
 * reducer no-ops identical values, so those are harmless.
 *
 * Defaults live in the parse helpers: missing/invalid `page` applies index
 * `0`, `pageSize` is validated against the shared page-size options, the
 * filters default to `''`/`null`. The legacy `partyId` param is still read
 * as a fallback for `supplierId`.
 */
@Injectable()
export class PayablesListUrlEffects {
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
      map(([, , queryParams]) => {
        const query = queryParams as Params;
        return PAYABLES_LIST_ACTIONS.setQueryFromUrl({
          pageIndex: pageIndexFromPageParam(numberParamValue(query['page'])),
          pageSize: this.pagination.pageSizeFromQuery(numberParamValue(query['pageSize'])),
          supplierIdFilter:
            scalarParamValue(query['supplierId'])?.toString().trim() ||
            scalarParamValue(query['partyId'])?.toString().trim() ||
            '',
          sourceIdFilter: scalarParamValue(query['sourceId'])?.toString().trim() ?? '',
          isPaidFilter: isPaidParamValue(scalarParamValue(query['isPaid'])),
        });
      }),
    ),
  );
}

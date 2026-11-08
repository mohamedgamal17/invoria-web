import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { getRouterSelectors, routerNavigatedAction } from '@ngrx/router-store';
import { filter, map, withLatestFrom } from 'rxjs';
import type { Params } from '@angular/router';

import { numberParamValue, scalarParamValue } from '../../../../shared/utils/url-query-params';
import { parseOptionalEnumScalarParam } from '../../../../shared/navigation/query-param-parsers';
import { PaginationService } from '../../../../shared/utils/pagination.service';
import {
  OrderStatus
} from '../../models/order.entity';
import { PaymentStatus, PaymentType } from '../../models/order-payment.enums';
import { ORDERS_LIST_ACTIONS } from '../orders-list/orders-list.actions';

const { selectQueryParams, selectUrl } = getRouterSelectors();

/** Matches `/orders` only — never `/orders/new`, `/orders/:id` or `/orders/reports/*`. */
const LIST_ROUTE_URL_PATTERN = /^\/orders(?:[?#]|$)/;

const ORDER_STATUS_VALUES = Object.values(OrderStatus).filter(
  (value): value is number => typeof value === 'number',
);
const PAYMENT_STATUS_VALUES = Object.values(PaymentStatus).filter(
  (value): value is number => typeof value === 'number',
);
const PAYMENT_TYPE_VALUES = Object.values(PaymentType).filter(
  (value): value is number => typeof value === 'number',
);

/** Normalizes the 1-based `page` query param to a 0-based page index; invalid values fall back to `0`. */
function pageIndexFromPageParam(raw: number | null): number {
  const parsed = raw === null ? 0 : raw;
  return Number.isFinite(parsed) && parsed >= 1 && Number.isInteger(parsed) ? parsed - 1 : 0;
}

/**
 * URL adapter: applies the `page` (1-based) / `pageSize` / `q` / `status` /
 * `paymentStatus` / `paymentType` query params of the orders list route into
 * the list state slice. The page component observes nothing from the URL; the
 * store reacts to router events instead, so the page/back buttons and deep
 * links drive the list the same way.
 *
 * Triggers:
 * - `ROUTER_NAVIGATED` for navigations landing on `/orders` (any other
 *   route — including order details or forms — is gated out by the URL pattern).
 *
 * The component's own `merge` query writes round-trip through here too; the
 * reducer no-ops identical values, so those are harmless.
 *
 * Defaults live in the parse helpers: missing/invalid `page` applies index
 * `0`, `pageSize` is validated against the shared page-size options, `q` is
 * trimmed (default `''`), and the enum params default to `null` (no filter).
 */
@Injectable()
export class OrdersListUrlEffects {
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
        ORDERS_LIST_ACTIONS.setQueryFromUrl({
          pageIndex: pageIndexFromPageParam(numberParamValue((queryParams as Params)['page'])),
          pageSize: this.pagination.pageSizeFromQuery(
            numberParamValue((queryParams as Params)['pageSize']),
          ),
          orderNumberFilter:
            scalarParamValue((queryParams as Params)['q'])?.toString().trim() ?? '',
          statusFilter: parseOptionalEnumScalarParam(
            scalarParamValue((queryParams as Params)['status']),
            ORDER_STATUS_VALUES,
          ),
          paymentStatusFilter: parseOptionalEnumScalarParam(
            scalarParamValue((queryParams as Params)['paymentStatus']),
            PAYMENT_STATUS_VALUES,
          ),
          paymentTypeFilter: parseOptionalEnumScalarParam(
            scalarParamValue((queryParams as Params)['paymentType']),
            PAYMENT_TYPE_VALUES,
          ),
        }),
      ),
    ),
  );
}

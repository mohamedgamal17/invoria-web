import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store, type Action } from '@ngrx/store';
import { getRouterSelectors, routerNavigatedAction } from '@ngrx/router-store';
import { filter, map, mergeMap, of, withLatestFrom } from 'rxjs';
import type { Params } from '@angular/router';

import { numberParamValue, scalarParamValue } from '../../../../shared/utils/url-query-params';
import { PaginationService } from '../../../../shared/utils/pagination.service';
import { toProductDetailsTab } from '../../utils/product-details-tab';
import { PRODUCT_DETAILS_ACTIONS } from '../product-details/product-details.actions';
import { productDetailsSelectors } from '../product-details/product-details.selectors';
import { ProductDetailsTab } from '../product-details/product-details.reducer';
import { PRODUCT_BATCHES_ACTIONS } from '../product-details-batches/product-details-batches.actions';

const { selectQueryParams, selectRouteParams } = getRouterSelectors();

/** Normalizes the 1-based `page` query param to a 0-based page index; invalid values fall back to `0`. */
function pageIndexFromPageParam(raw: number | null): number {
  const parsed = raw === null ? 0 : raw;
  return Number.isFinite(parsed) && parsed >= 1 && Number.isInteger(parsed) ? parsed - 1 : 0;
}

/**
 * URL adapter: applies the `tab` / `page` (1-based) / `pageSize` query params of
 * the product details route into the feature state modules. The page component
 * observes nothing from the URL; the store reacts to router events instead.
 *
 * Triggers:
 * - `ROUTER_NAVIGATED` (any navigation while the details route is active —
 *   includes the `replaceUrl` writes the component performs itself; the
 *   reducers no-op identical values so those round-trips are harmless).
 * - `Load Product Success` (a deep link `?tab=...`/`?page=...` arrives
 *   before the product exists; this re-applies the URL once the product
 *   context is in place).
 *
 * Defaults live in the parse helpers: missing/invalid `tab` keeps the current
 * tab, missing/invalid `page` applies the default index (`0`), `pageSize` is
 * validated against the shared page-size options (default `25`).
 */
@Injectable()
export class ProductDetailsUrlEffects {
  private readonly actions$ = inject(Actions);
  private readonly store = inject(Store);
  private readonly pagination = inject(PaginationService);

  readonly applyUrlQuery$ = createEffect(() =>
    this.actions$.pipe(
      ofType(routerNavigatedAction, PRODUCT_DETAILS_ACTIONS.loadProductSuccess),
      withLatestFrom(
        this.store.select(selectQueryParams),
        this.store.select(selectRouteParams),
        this.store.select(productDetailsSelectors.selectProduct),
        this.store.select(productDetailsSelectors.selectIsLoading),
      ),
      filter(
        ([, queryParams, routeParams, product, isLoading]) =>
          queryParams !== undefined &&
          routeParams !== undefined &&
          typeof routeParams['id'] === 'string' &&
          routeParams['id'].length > 0 &&
          product !== null &&
          !isLoading &&
          product.id === routeParams['id'],
      ),
      map(([, queryParams]) => this.actionsFromUrlQuery(queryParams as Params)),
      mergeMap((actions) => of(...actions)),
    ),
  );

  /** Builds the state actions for one URL query; reducers no-op identical values.
   *  Paging is applied BEFORE the tab gate: the `loadBatches` reducer stays idle
   *  while `batchesTabOpened` is false, so one URL batch funnels into exactly one
   *  fetch that already sees the settled paging values. */
  private actionsFromUrlQuery(queryParams: Params): Action[] {
    const tab = toProductDetailsTab(scalarParamValue(queryParams['tab']));
    const actions: Action[] = [
      PRODUCT_BATCHES_ACTIONS.setPagingFromUrl({
        pageIndex: pageIndexFromPageParam(numberParamValue(queryParams['page'])),
        pageSize: this.pagination.normalizePageSize(numberParamValue(queryParams['pageSize'])),
      }),
    ];
    if (tab !== null) {
      actions.push(PRODUCT_DETAILS_ACTIONS.setActiveTab({ activeTab: tab }));
      if (tab === ProductDetailsTab.Batches) {
        actions.push(PRODUCT_BATCHES_ACTIONS.batchesTabOpened());
      }
    }
    return actions;
  }
}

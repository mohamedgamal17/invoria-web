import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { type Action, Store } from '@ngrx/store';
import {
  catchError,
  distinctUntilChanged,
  filter,
  forkJoin,
  map,
  mergeMap,
  of,
  switchMap,
  withLatestFrom,
  type Observable,
} from 'rxjs';

import { APP_ERROR_ACTIONS } from '../../../../shared/store/app-error.actions';
import { LOAD_STATUS } from '../../../../shared/models/load-status';
import type { ApiResponse } from '../../../../core/models/api-response';
import type { ReportOverview } from '../../../../shared/models/report-overview';
import { ReportPeriod } from '../../../../shared/models/report-period';
import { CustomersApiService } from '../../../customers/services/customers-api.service';
import { ProductsApiService } from '../../../products/services/products-api.service';
import { OrdersApiService } from '../../../orders/services/orders-api.service';
import { SuppliersApiService } from '../../../suppliers/services/suppliers-api.service';
import { PurchaseOrdersApiService } from '../../../procurement/services/purchase-orders-api.service';
import { DASHBOARD_ACTIONS } from './dashboard.actions';
import { dashboardFeature, type DashboardState } from './dashboard.reducer';

/** One report-overview source outcome: the overview or a caught error (never both). */
interface OverviewSourceResult<PeriodEntityType> {
  overview: ReportOverview<PeriodEntityType> | null;
  error: unknown | null;
}

/** Per-page fetch identity for both metrics endpoints on the dashboard. */
interface ListDashboardMetricsRequest {
  Period: ReportPeriod;
  Skip: number;
  Length: number;
}

/** Metrics window shown by the dashboard chart cards ("Last 14 periods"). */
const METRICS_PAGE_LENGTH = 14;

/**
 * Data-only effects for the dashboard slice. Error presentation is owned by
 * the global `AppErrorEffects` (via `APP_ERROR_ACTIONS.apiError`); partial
 * overview-source failures surface the same way and recover as `null` sources.
 */
@Injectable()
export class DashboardEffects {
  private readonly actions$ = inject(Actions);
  private readonly store = inject(Store);
  private readonly customersApi = inject(CustomersApiService);
  private readonly productsApi = inject(ProductsApiService);
  private readonly ordersApi = inject(OrdersApiService);
  private readonly suppliersApi = inject(SuppliersApiService);
  private readonly purchaseOrdersApi = inject(PurchaseOrdersApiService);

  /** Refresh funnels into both reloads: overviews go through their own guard. */
  readonly funnelRefresh$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DASHBOARD_ACTIONS.refresh),
      mergeMap(() =>
        of(DASHBOARD_ACTIONS.loadOverviews(), DASHBOARD_ACTIONS.loadMetrics()),
      ),
    ),
  );

  /** Period selection funnels into the single per-period fetch trigger. */
  readonly funnelSelection$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DASHBOARD_ACTIONS.selectPeriod),
      map(() => DASHBOARD_ACTIONS.loadMetrics()),
    ),
  );

  /** Overview fetch: each source recovers as `null`; failures toast via AppErrorEffects. */
  readonly fetchOverviews$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DASHBOARD_ACTIONS.loadOverviews),
      withLatestFrom(this.store.select(dashboardFeature.selectDashboardState)),
      filter(([, state]) => state.request.status === LOAD_STATUS.Loading),
      distinctUntilChanged((leftSource, rightSource) => leftSource[1] === rightSource[1]),
      switchMap(() => this.fetchOverviews()),
    ),
  );

  /** Sales-profit metrics fetch for every period marked in flight by the reducer. */
  readonly fetchSalesProfitMetrics$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DASHBOARD_ACTIONS.loadMetrics),
      withLatestFrom(this.store.select(dashboardFeature.selectDashboardState)),
      filter(([, state]) => state.salesProfitLoadingPeriods.includes(state.selectedPeriod)),
      distinctUntilChanged((leftSource, rightSource) => leftSource[1] === rightSource[1]),
      // Concurrent, not switching: switching periods must not cancel a pending fetch.
      mergeMap(([, state]) => this.fetchSalesProfitMetrics(state.selectedPeriod)),
    ),
  );

  /** Sales metrics fetch for every period marked in flight by the reducer. */
  readonly fetchSalesMetrics$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DASHBOARD_ACTIONS.loadMetrics),
      withLatestFrom(this.store.select(dashboardFeature.selectDashboardState)),
      filter(([, state]) => state.salesLoadingPeriods.includes(state.selectedPeriod)),
      distinctUntilChanged((leftSource, rightSource) => leftSource[1] === rightSource[1]),
      mergeMap(([, state]) => this.fetchSalesMetrics(state.selectedPeriod)),
    ),
  );

  private fetchOverviews(): Observable<Action> {
    return this.collectOverviewSources().pipe(
      mergeMap((sources) => {
        const failedSources = Object.values(sources).filter((source) => source.error !== null);
        return of(
          DASHBOARD_ACTIONS.loadOverviewsSuccess({
            customers: sources.customers.overview,
            products: sources.products.overview,
            suppliers: sources.suppliers.overview,
            orderSales: sources.orderSales.overview,
            orderProfit: sources.orderProfit.overview,
            orderCompletion: sources.orderCompletion.overview,
            purchaseSales: sources.purchaseSales.overview,
          }),
          ...failedSources.map((source) =>
            APP_ERROR_ACTIONS.apiError({ error: source.error }),
          ),
        );
      }),
      // Per-source `catchError` makes this unreachable; kept as a safety net.
      catchError((error: unknown) =>
        of(
          DASHBOARD_ACTIONS.loadOverviewsFailure({ error }),
          APP_ERROR_ACTIONS.apiError({ error }),
        ),
      ),
    );
  }

  private collectOverviewSources() {
    return forkJoin({
      customers: this.customersApi.getCustomerCreationReportOverview().pipe(this.recoverSource()),
      products: this.productsApi.getProductCreationReportOverview().pipe(this.recoverSource()),
      suppliers: this.suppliersApi.getSupplierCreationReportOverview().pipe(this.recoverSource()),
      orderSales: this.ordersApi.getOrderSalesReportOverview().pipe(this.recoverSource()),
      orderProfit: this.ordersApi.getOrderSalesProfitReportOverview().pipe(this.recoverSource()),
      orderCompletion: this.ordersApi.getOrderCompletionReportOverview().pipe(this.recoverSource()),
      purchaseSales: this.purchaseOrdersApi.getPurchaseSalesReportOverview().pipe(this.recoverSource()),
    });
  }

  /** Turns one overview source into a recoverable result (payload or caught error). */
  private recoverSource<PeriodEntityType>() {
    return (source: Observable<ApiResponse<ReportOverview<PeriodEntityType>>>) =>
      source.pipe(
        map((response) => ({
          overview: response.isSuccess && response.result ? response.result : null,
          error: null,
        })),
        catchError((error: unknown) => of({ overview: null, error })),
      );
  }

  private fetchSalesProfitMetrics(period: ReportPeriod): Observable<Action> {
    const request: ListDashboardMetricsRequest = {
      Period: period,
      Skip: 0,
      Length: METRICS_PAGE_LENGTH,
    };
    return this.ordersApi.listOrderSalesProfitReportMetrics(request).pipe(
      mergeMap((response) => {
        if (!response.isSuccess || !response.result) {
          const error = response.error ?? new Error('Failed to load sales-profit metrics.');
          return of(
            DASHBOARD_ACTIONS.loadSalesProfitMetricsFailure({ period, error }),
            APP_ERROR_ACTIONS.apiError({ error }),
          );
        }
        return of(
          DASHBOARD_ACTIONS.loadSalesProfitMetricsSuccess({ period, points: response.result.data }),
        );
      }),
      catchError((error: unknown) =>
        of(
          DASHBOARD_ACTIONS.loadSalesProfitMetricsFailure({ period, error }),
          APP_ERROR_ACTIONS.apiError({ error }),
        ),
      ),
    );
  }

  private fetchSalesMetrics(period: ReportPeriod): Observable<Action> {
    const request: ListDashboardMetricsRequest = {
      Period: period,
      Skip: 0,
      Length: METRICS_PAGE_LENGTH,
    };
    return this.ordersApi.listOrderSalesReportMetrics(request).pipe(
      mergeMap((response) => {
        if (!response.isSuccess || !response.result) {
          const error = response.error ?? new Error('Failed to load sales metrics.');
          return of(
            DASHBOARD_ACTIONS.loadSalesMetricsFailure({ period, error }),
            APP_ERROR_ACTIONS.apiError({ error }),
          );
        }
        return of(
          DASHBOARD_ACTIONS.loadSalesMetricsSuccess({ period, points: response.result.data }),
        );
      }),
      catchError((error: unknown) =>
        of(
          DASHBOARD_ACTIONS.loadSalesMetricsFailure({ period, error }),
          APP_ERROR_ACTIONS.apiError({ error }),
        ),
      ),
    );
  }
}

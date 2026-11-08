import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, distinctUntilChanged, filter, map, mergeMap, of, switchMap, withLatestFrom } from 'rxjs';

import { APP_ERROR_ACTIONS } from '../../../../shared/store/app-error.actions';
import { LOAD_STATUS } from '../../../../shared/models/load-status';
import type { ApiResponse } from '../../../../core/models/api-response';
import type { Paging } from '../../../../core/models/paging';
import type { ListOrderRequest } from '../../../orders/models/list-order.request';
import { orderToUiOrder } from '../../../orders/models/order-ui.mapper';
import type { UiOrder } from '../../../orders/models/order-ui.model';
import { OrdersApiService } from '../../../orders/services/orders-api.service';
import { CUSTOMER_DETAILS_ACTIONS } from '../customer-details/customer-details.actions';
import { customerDetailsSelectors } from '../customer-details/customer-details.selectors';
import { CUSTOMER_ORDERS_ACTIONS } from './customer-details-orders.actions';
import {
  customerOrdersFeature,
  type CustomerOrdersState,
} from './customer-details-orders.reducer';

/**
 * Data-only effects for the customer orders slice. The lazy tab gate lives in
 * the reducer (`ordersTabOpened`); error presentation is owned by the global
 * `AppErrorEffects`.
 */
@Injectable()
export class CustomerOrdersEffects {
  private readonly actions$ = inject(Actions);
  private readonly store = inject(Store);
  private readonly listCustomerOrdersApi = inject(OrdersApiService);

  /** A new `:id` is being loaded → clear the orders slice (including the tab gate) for the incoming customer. */
  readonly resetOnCustomerLoad$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CUSTOMER_DETAILS_ACTIONS.loadCustomer),
      withLatestFrom(this.store.select(customerOrdersFeature.selectCustomerId)),
      filter(([{ customerId }, currentId]) => customerId !== currentId),
      map(([{ customerId }]) => CUSTOMER_ORDERS_ACTIONS.reset({ customerId })),
    ),
  );

  /** Funnel: every navigation/user change above becomes the single `Load Orders` trigger. */
  readonly prepareFetch$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        CUSTOMER_ORDERS_ACTIONS.ordersTabOpened,
        CUSTOMER_ORDERS_ACTIONS.setPagingFromUrl,
        CUSTOMER_ORDERS_ACTIONS.pageChange,
        CUSTOMER_ORDERS_ACTIONS.filtersChange,
        CUSTOMER_ORDERS_ACTIONS.filtersClear,
      ),
      map(() => CUSTOMER_ORDERS_ACTIONS.loadOrders()),
    ),
  );

  /** The Orders tab was already open when the customer entity arrived → (re)fetch now. */
  readonly prepareFetchOnCustomerRetrieved$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CUSTOMER_DETAILS_ACTIONS.loadCustomerSuccess),
      withLatestFrom(this.store.select(customerOrdersFeature.selectOrdersTabOpened)),
      filter(([, ordersTabOpened]) => ordersTabOpened),
      map(() => CUSTOMER_ORDERS_ACTIONS.loadOrders()),
    ),
  );

  /** The fetch itself: the reducer decides (via `fetchedQuery`) whether a request went in
   *  flight, so the effect only wakes when it did; cancels superseding triggers via `switchMap`.
   *  Duplicate `Load Orders` copies around the same in-flight query (their reducer pass
   *  no-ops and keeps the same state references) are suppressed by the round identity. */
  readonly fetchCustomerOrders$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CUSTOMER_ORDERS_ACTIONS.loadOrders),
      withLatestFrom(
        this.store.select(customerOrdersFeature.selectCustomerDetailsOrdersState),
        this.store.select(customerDetailsSelectors.selectCustomer),
      ),
      filter(([, state, customer]) => state.request.status === LOAD_STATUS.Loading && Boolean(customer)),
      distinctUntilChanged((prevSource, nextSource) =>
        sameFetchRound(prevSource[1], nextSource[1]),
      ),
      switchMap(([, state, customer]) => this.executeFetch(state, customer!.id)),
    ),
  );

  private executeFetch(state: CustomerOrdersState, customerId: string) {
    const filters = state.filters;
    const request: ListOrderRequest = {
      Skip: state.pageIndex * state.pageSize,
      Length: state.pageSize,
      IncludeOrderItems: true,
      CustomerId: customerId,
      OrderNumber: filters.orderNumber.trim() || null,
    };
    if (filters.status != null) {
      request.Status = filters.status;
    }
    if (filters.paymentStatus != null) {
      request.PaymentStatus = filters.paymentStatus;
    }
    if (filters.paymentType != null) {
      request.PaymentType = filters.paymentType;
    }

    return this.listCustomerOrdersApi.listOrders(request).pipe(
      map((res): ApiResponse<Paging<UiOrder>> => ({
        isSuccess: res.isSuccess,
        result: res.result
          ? {
              data: res.result.data.map(orderToUiOrder),
              info: res.result.info,
            }
          : undefined,
        error: res.error,
      })),
      mergeMap((res) => {
        if (res.isSuccess && res.result) {
          return of(
            CUSTOMER_ORDERS_ACTIONS.loadOrdersSuccess({
              orders: res.result.data,
              info: res.result.info,
            }),
          );
        }
        const error = res.error ?? new Error('Failed to load customer orders.');
        return of(
          CUSTOMER_ORDERS_ACTIONS.loadOrdersFailure({ error }),
          APP_ERROR_ACTIONS.apiError({ error }),
        );
      }),
      catchError((error: unknown) =>
        of(
          CUSTOMER_ORDERS_ACTIONS.loadOrdersFailure({ error }),
          APP_ERROR_ACTIONS.apiError({ error }),
        ),
      ),
    );
  }
}

/** Stable identity of one fetch round: a real start/failure creates new state references,
 *  while a no-oped duplicate `Load Orders` keeps the current ones untouched. */
function sameFetchRound(left: CustomerOrdersState, right: CustomerOrdersState): boolean {
  return left === right;
}

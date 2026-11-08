import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import type { Action } from '@ngrx/store';
import { catchError, mergeMap, of, switchMap } from 'rxjs';

import { APP_ERROR_ACTIONS } from '../../../../shared/store/app-error.actions';
import { OrdersApiService } from '../../services/orders-api.service';
import { OrderActionFacade, type OrderTransitionAction } from '../../services/order-action.facade';
import { orderToUiOrder } from '../../models/order-ui.mapper';
import type { UiOrder } from '../../models/order-ui.model';
import { ORDERS_LIST_ACTIONS } from '../orders-list/orders-list.actions';
import { ORDER_DETAILS_ACTIONS } from './order-details.actions';

/** Data-only effects: success/failure branching. Presentation is owned by the global `AppErrorEffects`. */
@Injectable()
export class OrderDetailsEffects {
  private readonly actions$ = inject(Actions);
  private readonly ordersApi = inject(OrdersApiService);
  private readonly orderActionFacade = inject(OrderActionFacade);

  /**
   * Fires when the page loads or navigates to another `:id` (`loadOrder`), or
   * on a background refetch (`refreshOrder`); `switchMap` keeps only the latest.
   */
  readonly loadOrder$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ORDER_DETAILS_ACTIONS.loadOrder, ORDER_DETAILS_ACTIONS.refreshOrder),
      switchMap(({ orderId }) =>
        this.ordersApi.getOrder(orderId).pipe(
          mergeMap((res) => {
            if (res.isSuccess && res.result) {
              return of(ORDER_DETAILS_ACTIONS.loadOrderSuccess({ order: orderToUiOrder(res.result) }));
            }
            const error = res.error ?? new Error('Failed to load the order.');
            return of(
              ORDER_DETAILS_ACTIONS.loadOrderFailure({ error }),
              APP_ERROR_ACTIONS.apiError({ error }),
            );
          }),
          catchError((error: unknown) =>
            of(
              ORDER_DETAILS_ACTIONS.loadOrderFailure({ error }),
              APP_ERROR_ACTIONS.apiError({ error }),
            ),
          ),
        ),
      ),
    ),
  );

  /** Confirmed order transition; the reducer folds the returned entity in, the
   *  `orders-list` slice is synced locally (accepted/revision/completed/cancelled). */
  readonly recordAction$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ORDER_DETAILS_ACTIONS.recordAction),
      switchMap(({ action, orderId, body }) =>
        this.orderActionFacade.execute(action, orderId, body).pipe(
          mergeMap((res) => {
            if (res.isSuccess && res.result) {
              const order = orderToUiOrder(res.result);
              const sync = ordersListSyncAction(action, order);
              const actions: Action[] = [
                ORDER_DETAILS_ACTIONS.recordActionSuccess({ action, order }),
              ];
              if (sync) {
                actions.push(sync);
              }
              return of(...actions);
            }
            const error = res.error ?? new Error('The order action failed.');
            return of(
              ORDER_DETAILS_ACTIONS.recordActionFailure({ error }),
              APP_ERROR_ACTIONS.apiError({ error }),
            );
          }),
          catchError((error: unknown) =>
            of(
              ORDER_DETAILS_ACTIONS.recordActionFailure({ error }),
              APP_ERROR_ACTIONS.apiError({ error }),
            ),
          ),
        ),
      ),
    ),
  );
}

/** Which `orders-list` local-sync action mirrors a details-page transition, if any. */
function ordersListSyncAction(
  action: OrderTransitionAction,
  order: UiOrder,
): Action | null {
  switch (action) {
    case 'accept':
      return ORDERS_LIST_ACTIONS.orderAccepted({ order });
    case 'requestRevision':
      return ORDERS_LIST_ACTIONS.orderRevisionRequested({ order });
    case 'complete':
      return ORDERS_LIST_ACTIONS.orderCompleted({ order });
    case 'cancel':
      return ORDERS_LIST_ACTIONS.orderCancelled({ order });
    default:
      return null;
  }
}

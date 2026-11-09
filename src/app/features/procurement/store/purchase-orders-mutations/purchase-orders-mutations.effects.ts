import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { MessageService } from 'primeng/api';
import { Observable, catchError, exhaustMap, mergeMap, of, tap } from 'rxjs';

import { APP_ERROR_ACTIONS } from '../../../../shared/store/app-error.actions';
import type { ApiResponse } from '../../../../core/models/api-response';
import type { PurchaseOrder } from '../../models/purchase-order.entity';
import type { PurchaseOrderTransitionAction } from '../../models/purchase-order-actions';
import { PurchaseOrdersApiService } from '../../services/purchase-orders-api.service';
import { PURCHASE_ORDERS_LIST_ACTIONS } from '../purchase-orders-list/purchase-orders-list.actions';
import { PURCHASE_ORDERS_MUTATIONS_ACTIONS } from './purchase-orders-mutations.actions';

/**
 * Store-owned purchase order state transitions. Success dispatches the local
 * list-sync action so the purchase orders list (provided on the same parent
 * route) folds the returned entity in without refetching; API errors are
 * presented by the global `AppErrorEffects`.
 */
@Injectable()
export class PurchaseOrdersMutationsEffects {
  private readonly actions$ = inject(Actions);
  private readonly purchaseOrdersApi = inject(PurchaseOrdersApiService);
  private readonly messageService = inject(MessageService);

  readonly transitionPurchaseOrder$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PURCHASE_ORDERS_MUTATIONS_ACTIONS.transitionPurchaseOrder),
      exhaustMap(({ id, action }) =>
        this.transitionRequest(id, action).pipe(
          mergeMap((res) => {
            if (res.isSuccess && res.result) {
              return of(
                PURCHASE_ORDERS_MUTATIONS_ACTIONS.transitionPurchaseOrderSuccess({
                  purchaseOrder: res.result,
                }),
                PURCHASE_ORDERS_LIST_ACTIONS.purchaseOrderUpdated({ purchaseOrder: res.result }),
              );
            }
            const error = res.error ?? new Error('Failed to update the purchase order state.');
            return of(
              PURCHASE_ORDERS_MUTATIONS_ACTIONS.transitionPurchaseOrderFailure({ error }),
              APP_ERROR_ACTIONS.apiError({ error }),
            );
          }),
          catchError((error: unknown) =>
            of(
              PURCHASE_ORDERS_MUTATIONS_ACTIONS.transitionPurchaseOrderFailure({ error }),
              APP_ERROR_ACTIONS.apiError({ error }),
            ),
          ),
        ),
      ),
    ),
  );

  /** Success presentation: toast on the shell `p-toast`. */
  readonly presentTransitionSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(PURCHASE_ORDERS_MUTATIONS_ACTIONS.transitionPurchaseOrderSuccess),
        tap(() => {
          this.messageService.add({
            severity: 'success',
            summary: 'Updated',
            detail: 'Purchase order state was updated.',
          });
        }),
      ),
    { dispatch: false },
  );

  private transitionRequest(
    id: string,
    action: PurchaseOrderTransitionAction,
  ): Observable<ApiResponse<PurchaseOrder>> {
    switch (action) {
      case 'submit':
        return this.purchaseOrdersApi.submitPurchaseOrder(id);
      case 'approve':
        return this.purchaseOrdersApi.approvePurchaseOrder(id);
      case 'reject':
        return this.purchaseOrdersApi.rejectPurchaseOrder(id);
      case 'cancel':
        return this.purchaseOrdersApi.cancelPurchaseOrder(id);
      case 'complete':
        return this.purchaseOrdersApi.completePurchaseOrder(id);
      case 'reopen':
        return this.purchaseOrdersApi.reopenPurchaseOrder(id);
    }
  }
}

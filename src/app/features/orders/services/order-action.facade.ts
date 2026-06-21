import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';

import type { ApiResponse } from '../../../core/models/api-response';
import type { Order } from '../models/order.entity';
import { OrdersApiService } from './orders-api.service';
import type { OrderActionKey } from '../models/order-actions';
import { ORDER_ACTION_UI } from '../models/order-actions';

export type OrderTransitionAction = Exclude<OrderActionKey, 'edit' | 'returnItems'>;

@Injectable({
  providedIn: 'root'
})
export class OrderActionFacade {
  private readonly ordersApi = inject(OrdersApiService);

  execute(action: OrderTransitionAction, orderId: string): Observable<ApiResponse<Order>> {
    switch (action) {
      case 'accept':
        return this.ordersApi.acceptOrder(orderId);
      case 'requestRevision':
        return this.ordersApi.requestRevisionOrder(orderId);
      case 'complete':
        return this.ordersApi.completeOrder(orderId);
      case 'cancel':
        return this.ordersApi.cancelOrder(orderId);
      default:
        return throwError(() => new Error(`Unsupported order action: ${String(action)}`));
    }
  }

  meta(action: OrderTransitionAction) {
    return ORDER_ACTION_UI[action];
  }
}

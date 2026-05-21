import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';

import type { ApiResponse } from '../../../core/models/api-response';
import type { Order } from '../models/order.entity';
import { OrdersApiService } from './orders-api.service';
import type { OrderActionKey } from '../models/order-actions';
import { ORDER_ACTION_UI } from '../models/order-actions';

export type OrderTransitionAction = Exclude<OrderActionKey, 'edit'>;

@Injectable({
  providedIn: 'root'
})
export class OrderActionFacade {
  private readonly ordersApi = inject(OrdersApiService);

  execute(action: OrderTransitionAction, orderId: string): Observable<ApiResponse<Order>> {
    switch (action) {
      case 'accept':
        return this.ordersApi.acceptOrder(orderId);
      case 'dispatch':
        return this.ordersApi.dispatchOrder(orderId);
      case 'ship':
        return this.ordersApi.shipOrder(orderId);
      case 'complete':
        return this.ordersApi.completeOrder(orderId);
      case 'cancel':
        return this.ordersApi.cancelOrder(orderId);
      case 'reopen':
        return this.ordersApi.reopenOrder(orderId);
      case 'refuse':
        return this.ordersApi.refuseOrder(orderId);
      default:
        return throwError(() => new Error(`Unsupported order action: ${String(action)}`));
    }
  }

  meta(action: OrderTransitionAction) {
    return ORDER_ACTION_UI[action];
  }
}

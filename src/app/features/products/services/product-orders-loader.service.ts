import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, map, of, switchMap } from 'rxjs';

import type { ApiResponse } from '../../../core/models/api-response';
import type { Paging } from '../../../core/models/paging';
import type { Order } from '../../orders/models/order.entity';
import { orderToUiOrder } from '../../orders/models/order-ui.mapper';
import type { UiOrder } from '../../orders/models/order-ui.model';
import { OrdersApiService } from '../../orders/services/orders-api.service';

const PAGE_SIZE = 100;
const MAX_PAGES = 50;

@Injectable({ providedIn: 'root' })
export class ProductOrdersLoaderService {
  private readonly ordersApi = inject(OrdersApiService);

  /** Loads all orders (paged) with line items for product-level summaries. */
  loadAllOrdersWithItems(): Observable<UiOrder[]> {
    return this.ordersApi
      .listOrders({ Skip: 0, Length: PAGE_SIZE, IncludeOrderItems: true })
      .pipe(
        switchMap((first) => this.loadRemainingPages(first)),
        map((orders) => orders.map(orderToUiOrder))
      );
  }

  private loadRemainingPages(
    first: ApiResponse<Paging<Order>>
  ): Observable<Order[]> {
    if (!first.isSuccess || !first.result) {
      return of([]);
    }

    const { data, info } = first.result;
    const totalPages = Math.min(Math.ceil(info.totalCount / PAGE_SIZE), MAX_PAGES);
    if (totalPages <= 1) {
      return of(data);
    }

    const pageRequests = Array.from({ length: totalPages - 1 }, (_, index) =>
      this.ordersApi.listOrders({
        Skip: (index + 1) * PAGE_SIZE,
        Length: PAGE_SIZE,
        IncludeOrderItems: true
      })
    );

    return forkJoin(pageRequests).pipe(
      map((responses) => {
        const rest = responses.flatMap((res) =>
          res.isSuccess && res.result ? res.result.data : []
        );
        return [...data, ...rest];
      })
    );
  }
}

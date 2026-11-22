import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, map, of, switchMap } from 'rxjs';

import type { ApiResponse } from '@invoria/core';
import type { Paging } from '@invoria/core';
import type { Order } from '@invoria/sales';
import { orderToUiOrder } from '@invoria/sales';
import type { UiOrder } from '@invoria/sales';
import { OrdersApiService } from '@invoria/sales';

const PAGE_SIZE = 100;
const MAX_PAGES = 50;

@Injectable({ providedIn: 'root' })
export class ProductOrdersLoaderService {
  private readonly ordersApi = inject(OrdersApiService);

  /** Loads all orders (paged) with line items for product-level summaries. */
  loadAllOrdersWithItems(): Observable<UiOrder[]> {
    return this.ordersApi
      .listOrders({ skip: 0, length: PAGE_SIZE, includeOrderItems: true })
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
        skip: (index + 1) * PAGE_SIZE,
        length: PAGE_SIZE,
        includeOrderItems: true
      })
    );

    return forkJoin(pageRequests).pipe(
      map((responses) => {
        const rest = responses.flatMap((response) =>
          response.isSuccess && response.result ? response.result.data : []
        );
        return [...data, ...rest];
      })
    );
  }
}

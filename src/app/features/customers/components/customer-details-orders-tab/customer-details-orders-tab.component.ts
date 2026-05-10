import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, linkedSignal, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';

import { MessageService } from 'primeng/api';

import { presentApiError } from '../../../../core/http/api-error.presenter';
import type { PagingInfo } from '../../../../core/models/paging';
import {
  OrdersFilterPanelComponent,
  type OrdersListFilters
} from '../../../orders/components/orders-filter-panel/orders-filter-panel.component';
import { OrderListComponent } from '../../../orders/components/order-list/order-list.component';
import type { ListOrderRequest } from '../../../orders/models/list-order.request';
import type { UiOrder } from '../../../orders/models/order-ui.model';
import { orderToUiOrder } from '../../../orders/models/order-ui.mapper';
import { OrdersApiService } from '../../../orders/services/orders-api.service';

const EMPTY_ORDERS_TUPLE: [UiOrder[], PagingInfo] = [
  [],
  { length: 0, skip: 0, totalCount: 0 }
];

@Component({
  selector: 'app-customer-details-orders-tab',
  standalone: true,
  imports: [CommonModule, OrdersFilterPanelComponent, OrderListComponent],
  templateUrl: './customer-details-orders-tab.component.html'
})
export class CustomerDetailsOrdersTabComponent {
  readonly pageSizeOptions = [25, 50, 100, 200];

  private readonly ordersApi = inject(OrdersApiService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);

  readonly customerId = input.required<string>();

  readonly pageIndex = signal(0);
  readonly pageSize = signal(25);

  readonly orderNumber = signal('');
  readonly orderStatusFilter = signal<number | null>(null);
  readonly paymentStatusFilter = signal<number | null>(null);
  readonly paymentTypeFilter = signal<number | null>(null);

  readonly first = computed(() => this.pageIndex() * this.pageSize());

  readonly listRequest = computed((): ListOrderRequest => {
    const req: ListOrderRequest = {
      Skip: this.pageIndex() * this.pageSize(),
      Length: this.pageSize(),
      IncludeOrderItems: true,
      CustomerId: this.customerId(),
      OrderNumber: this.orderNumber().trim() || null
    };
    const st = this.orderStatusFilter();
    const ps = this.paymentStatusFilter();
    const pt = this.paymentTypeFilter();
    if (st != null) {
      req.Status = st;
    }
    if (ps != null) {
      req.PaymentStatus = ps;
    }
    if (pt != null) {
      req.PaymentType = pt;
    }
    return req;
  });

  readonly ordersResource = rxResource<[UiOrder[], PagingInfo], ListOrderRequest>({
    params: () => this.listRequest(),
    defaultValue: EMPTY_ORDERS_TUPLE,
    stream: ({ params }) =>
      this.ordersApi.listOrders(params).pipe(
        map((res) => {
          if (!res.isSuccess || !res.result) {
            this.showApiError(res.error);
            return EMPTY_ORDERS_TUPLE;
          }
          const uiRows = res.result.data.map(orderToUiOrder);
          return [uiRows, res.result.info] as [UiOrder[], PagingInfo];
        }),
        catchError((err: unknown) => {
          this.showApiError(err);
          return of(EMPTY_ORDERS_TUPLE);
        })
      )
  });

  readonly displayOrders = linkedSignal({
    source: () => this.ordersLinkSource(),
    computation: (src) => [...src.orders]
  });

  readonly displayPaging = linkedSignal({
    source: () => this.ordersLinkSource(),
    computation: (src) => ({ ...src.paging })
  });

  goToDetails(order: UiOrder): void {
    void this.router.navigate(['/orders', order.id]);
  }

  onPageChange(event: { first?: number; rows?: number; page?: number }): void {
    const firstEvt = event.first ?? 0;
    const rows = event.rows ?? this.pageSize();
    const newPageIndex =
      event.page !== undefined ? event.page : Math.floor(firstEvt / Math.max(rows, 1));

    if (this.pageIndex() !== newPageIndex || this.pageSize() !== rows) {
      const isManualPageChange = this.pageIndex() !== newPageIndex;
      this.pageSize.set(rows);
      this.pageIndex.set(newPageIndex);
      if (isManualPageChange) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }

  onFiltersChange(filters: OrdersListFilters): void {
    const normalized = filters.orderNumber.trim();
    if (
      normalized === this.orderNumber().trim() &&
      filters.status === this.orderStatusFilter() &&
      filters.paymentStatus === this.paymentStatusFilter() &&
      filters.paymentType === this.paymentTypeFilter()
    ) {
      return;
    }

    this.orderNumber.set(filters.orderNumber);
    this.orderStatusFilter.set(filters.status);
    this.paymentStatusFilter.set(filters.paymentStatus);
    this.paymentTypeFilter.set(filters.paymentType);
    this.pageIndex.set(0);
  }

  onClearFilters(): void {
    if (
      !this.orderNumber().trim() &&
      this.orderStatusFilter() == null &&
      this.paymentStatusFilter() == null &&
      this.paymentTypeFilter() == null
    ) {
      return;
    }

    this.orderNumber.set('');
    this.orderStatusFilter.set(null);
    this.paymentStatusFilter.set(null);
    this.paymentTypeFilter.set(null);
    this.pageIndex.set(0);
  }

  private ordersLinkSource(): {
    request: ListOrderRequest;
    orders: UiOrder[];
    paging: PagingInfo;
  } {
    const [orders, paging] = this.ordersResource.value();
    return {
      request: this.listRequest(),
      orders,
      paging
    };
  }

  private showApiError(error: unknown): void {
    const presentation = presentApiError(error);
    this.messageService.add(presentation.toast);
    if (presentation.routeTarget) {
      void this.router.navigate([presentation.routeTarget]);
    }
  }
}

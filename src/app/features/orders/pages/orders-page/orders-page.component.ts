import { CommonModule } from '@angular/common';
import { Component, computed, inject, linkedSignal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';

import { MessageService } from 'primeng/api';

import type { PagingInfo } from '../../../../core/models/paging';
import type { ListOrderRequest } from '../../models/list-order.request';
import { OrderStatus } from '../../models/order.entity';
import type { UiOrder } from '../../models/order-ui.model';
import { orderToUiOrder } from '../../models/order-ui.mapper';
import { PaymentStatus, PaymentType } from '../../models/order-payment.enums';
import { parseOptionalEnumQueryParam } from '../../models/orders-query-params';
import { OrdersApiService } from '../../services/orders-api.service';
import { OrderHeaderComponent } from '../../components/order-header/order-header.component';
import {
  OrdersFilterPanelComponent,
  type OrdersListFilters
} from '../../components/orders-filter-panel/orders-filter-panel.component';
import { OrderListComponent } from '../../components/order-list/order-list.component';
import { presentApiError } from '../../../../core/http/api-error.presenter';

const EMPTY_ORDERS_TUPLE: [UiOrder[], PagingInfo] = [
  [],
  { length: 0, skip: 0, totalCount: 0 }
];

const ORDER_STATUS_VALUES = Object.values(OrderStatus).filter(
  (v): v is number => typeof v === 'number'
);
const PAYMENT_STATUS_VALUES = Object.values(PaymentStatus).filter(
  (v): v is number => typeof v === 'number'
);
const PAYMENT_TYPE_VALUES = Object.values(PaymentType).filter(
  (v): v is number => typeof v === 'number'
);

@Component({
  selector: 'app-orders-page',
  standalone: true,
  imports: [CommonModule, OrderHeaderComponent, OrdersFilterPanelComponent, OrderListComponent],
  templateUrl: './orders-page.component.html'
})
export class OrdersPageComponent {
  readonly pageSizeOptions = [25, 50, 100, 200];

  private readonly ordersApi = inject(OrdersApiService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  /** 1-based page number from `?page=` (default 1). */
  private readonly pageFromRoute = toSignal(
    this.route.queryParamMap.pipe(
      map((m) => {
        const raw = m.get('page');
        const n = raw ? parseInt(raw, 10) : 1;
        return Number.isFinite(n) && n >= 1 ? n : 1;
      })
    ),
    { initialValue: 1 }
  );

  /** Page size from `?pageSize=` (must be in pageSizeOptions; default 25). */
  readonly pageSize = toSignal(
    this.route.queryParamMap.pipe(
      map((m) => {
        const raw = m.get('pageSize');
        const n = raw ? parseInt(raw, 10) : NaN;
        return this.pageSizeOptions.includes(n) ? n : 25;
      })
    ),
    { initialValue: 25 }
  );

  /** Order number filter from `?q=` (server-side `OrderNumber`). */
  readonly qFromRoute = toSignal(
    this.route.queryParamMap.pipe(
      map((m) => {
        const q = m.get('q')?.trim();
        return q ? q : '';
      })
    ),
    { initialValue: '' }
  );

  /** `OrderStatus` filter from `?status=` (server-side `Status`). */
  readonly orderStatusFilterFromRoute = toSignal(
    this.route.queryParamMap.pipe(
      map((m) => parseOptionalEnumQueryParam(m, 'status', ORDER_STATUS_VALUES))
    ),
    { initialValue: null as number | null }
  );

  /** Payment status filter from `?paymentStatus=`. */
  readonly paymentStatusFilterFromRoute = toSignal(
    this.route.queryParamMap.pipe(
      map((m) =>
        parseOptionalEnumQueryParam(m, 'paymentStatus', PAYMENT_STATUS_VALUES)
      )
    ),
    { initialValue: null as number | null }
  );

  /** Payment type filter from `?paymentType=`. */
  readonly paymentTypeFilterFromRoute = toSignal(
    this.route.queryParamMap.pipe(
      map((m) => parseOptionalEnumQueryParam(m, 'paymentType', PAYMENT_TYPE_VALUES))
    ),
    { initialValue: null as number | null }
  );

  /** 0-based page index derived from the URL. */
  readonly pageIndex = computed(() => Math.max(0, this.pageFromRoute() - 1));

  readonly first = computed(() => this.pageIndex() * this.pageSize());

  readonly listRequest = computed((): ListOrderRequest => {
    const req: ListOrderRequest = {
      Skip: this.pageIndex() * this.pageSize(),
      Length: this.pageSize(),
      IncludeOrderItems: true,
      OrderNumber: this.qFromRoute() || null
    };
    const st = this.orderStatusFilterFromRoute();
    const ps = this.paymentStatusFilterFromRoute();
    const pt = this.paymentTypeFilterFromRoute();
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

  goToCreatePage(): void {
    void this.router.navigate(['new'], { relativeTo: this.route });
  }

  goToDetails(order: UiOrder): void {
    void this.router.navigate([order.id], { relativeTo: this.route });
  }

  onPageChange(event: { first?: number; rows?: number; page?: number }): void {
    const firstEvt = event.first ?? 0;
    const rows = event.rows ?? this.pageSize();
    const newPageIndex =
      event.page !== undefined ? event.page : Math.floor(firstEvt / Math.max(rows, 1));

    if (this.pageIndex() !== newPageIndex || this.pageSize() !== rows) {
      const isManualPageChange = this.pageIndex() !== newPageIndex;

      void this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {
          page: newPageIndex + 1,
          pageSize: rows
        },
        queryParamsHandling: 'merge'
      });

      if (isManualPageChange) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }

  onFiltersChange(filters: OrdersListFilters): void {
    const normalized = filters.orderNumber.trim();
    if (
      normalized === this.qFromRoute() &&
      filters.status === this.orderStatusFilterFromRoute() &&
      filters.paymentStatus === this.paymentStatusFilterFromRoute() &&
      filters.paymentType === this.paymentTypeFilterFromRoute()
    ) {
      return;
    }

    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        q: normalized || null,
        status: filters.status != null ? String(filters.status) : null,
        paymentStatus:
          filters.paymentStatus != null ? String(filters.paymentStatus) : null,
        paymentType: filters.paymentType != null ? String(filters.paymentType) : null,
        page: 1
      },
      queryParamsHandling: 'merge'
    });
  }

  onClearFilters(): void {
    if (
      !this.qFromRoute() &&
      this.orderStatusFilterFromRoute() == null &&
      this.paymentStatusFilterFromRoute() == null &&
      this.paymentTypeFilterFromRoute() == null
    ) {
      return;
    }

    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        q: null,
        status: null,
        paymentStatus: null,
        paymentType: null,
        page: 1
      },
      queryParamsHandling: 'merge'
    });
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

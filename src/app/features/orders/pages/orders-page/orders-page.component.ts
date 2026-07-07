import { CommonModule } from '@angular/common';
import { Component, computed, inject, linkedSignal, signal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, finalize, map, of, Subject, debounceTime, switchMap, take, tap } from 'rxjs';

import { MessageService } from 'primeng/api';

import type { PagingInfo } from '../../../../core/models/paging';
import type { ListOrderRequest } from '../../models/list-order.request';
import { OrderStatus } from '../../models/order.entity';
import type { UiOrder } from '../../models/order-ui.model';
import { orderToUiOrder, draftItemsToLineItems } from '../../models/order-ui.mapper';
import { PaymentStatus, PaymentType } from '../../models/order-payment.enums';
import { parseOptionalEnumQueryParam } from '../../../../shared/navigation/query-param-parsers';
import { OrdersApiService } from '../../services/orders-api.service';
import { OrderHeaderComponent } from '../../components/order-header/order-header.component';
import {
  OrdersFilterPanelComponent,
  type OrdersListFilters
} from '../../components/orders-filter-panel/orders-filter-panel.component';
import { OrderListComponent } from '../../components/order-list/order-list.component';
import { OrderDialogComponent } from '../../components/order-dialog/order-dialog.component';
import { presentApiError } from '../../../../core/http/api-error.presenter';
import { CustomersApiService } from '../../../customers/services/customers-api.service';
import { ProductsApiService } from '../../../products/services/products-api.service';
import { customerSearchListRequest } from '../../../customers/models/list-customer.request';
import { productSearchListRequest } from '../../../products/models/list-product.request';
import type { Customer } from '../../../customers/models/customer.entity';
import type { Product } from '../../../products/models/product.entity';
import type { UiOrderItem } from '../../models/order-ui.model';

const ORDER_FORM_AUTOCOMPLETE_DEBOUNCE_MS = 700;

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
  imports: [CommonModule, OrderHeaderComponent, OrdersFilterPanelComponent, OrderListComponent, OrderDialogComponent],
  templateUrl: './orders-page.component.html'
})
export class OrdersPageComponent {
  readonly pageSizeOptions = [25, 50, 100, 200];

  private readonly ordersApi = inject(OrdersApiService);
  private readonly customersApi = inject(CustomersApiService);
  private readonly productsApi = inject(ProductsApiService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  /** Dialog quick-create state */
  readonly createDialogVisible = signal(false);
  readonly isProductLoading = signal(false);
  readonly isCustomerLoading = signal(false);
  readonly saving = signal(false);
  readonly dialogCustomer = signal<Customer | null>(null);
  readonly dialogCustomers = signal<Customer[]>([]);
  readonly dialogProduct = signal<Product | null>(null);
  readonly dialogProducts = signal<Product[]>([]);
  readonly dialogItemQuantity = signal(1);
  readonly dialogItemPrice = signal(0);
  readonly dialogPaymentType = signal<PaymentType>(PaymentType.Immediate);
  readonly dialogDraftItems = signal<UiOrderItem[]>([]);
  readonly dialogTotalAmount = signal(0);
  readonly dialogTotalItems = signal(0);

  private readonly productSearchCache = new Map<string, Product[]>();
  private readonly productQuery$ = new Subject<string>();
  private readonly customerQuery$ = new Subject<string>();

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

  constructor() {
    this.productQuery$
      .pipe(
        debounceTime(ORDER_FORM_AUTOCOMPLETE_DEBOUNCE_MS),
        switchMap((query) => {
          const cached = this.productSearchCache.get(query);
          if (cached !== undefined) {
            return of(cached);
          }
          this.isProductLoading.set(true);
          return this.productsApi.searchProducts(productSearchListRequest, query).pipe(
            tap((rows) => this.productSearchCache.set(query, rows)),
            catchError(() => of([] as Product[])),
            finalize(() => this.isProductLoading.set(false))
          );
        })
      )
      .subscribe((products) => this.dialogProducts.set(products));

    this.customerQuery$
      .pipe(
        debounceTime(ORDER_FORM_AUTOCOMPLETE_DEBOUNCE_MS),
        switchMap((query) => {
          this.isCustomerLoading.set(true);
          return this.customersApi.searchCustomers(customerSearchListRequest, query).pipe(
            catchError(() => of([] as Customer[])),
            finalize(() => this.isCustomerLoading.set(false))
          );
        })
      )
      .subscribe((customers) => this.dialogCustomers.set(customers));
  }

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

  /* Quick-create dialog handlers */

  openQuickCreate(): void {
    this.dialogCustomer.set(null);
    this.dialogCustomers.set([]);
    this.dialogProduct.set(null);
    this.dialogProducts.set([]);
    this.dialogDraftItems.set([]);
    this.dialogItemQuantity.set(1);
    this.dialogItemPrice.set(0);
    this.dialogPaymentType.set(PaymentType.Immediate);
    this.dialogTotalAmount.set(0);
    this.createDialogVisible.set(true);
  }

  closeQuickCreate(): void {
    this.createDialogVisible.set(false);
  }

  searchDialogCustomers(event: { query: string }): void {
    this.customerQuery$.next((event.query ?? '').trim());
  }

  onDialogCustomerSelect(): void {
    this.dialogCustomer.set(this.dialogCustomer());
  }

  clearDialogCustomer(): void {
    this.dialogCustomer.set(null);
  }

  searchDialogProducts(event: { query: string }): void {
    const query = (event.query ?? '').trim();
    const cached = this.productSearchCache.get(query);
    if (cached !== undefined) {
      this.dialogProducts.set([...cached]);
      this.isProductLoading.set(false);
      return;
    }
    this.productQuery$.next(query);
  }

  onDialogProductSelect(event: unknown): void {
    const product =
      event && typeof event === 'object' && 'value' in event
        ? (event as { value?: Product }).value
        : (event as Product);
    if (!product?.id) return;
    this.dialogProduct.set(product);
    this.dialogItemQuantity.set(1);
    this.dialogItemPrice.set(product.price);
  }

  clearDialogProduct(): void {
    this.dialogProduct.set(null);
    this.dialogItemQuantity.set(1);
    this.dialogItemPrice.set(0);
  }

  addDialogItem(): void {
    const product = this.dialogProduct();
    if (!product) return;
    const quantity = this.dialogItemQuantity() > 0 ? this.dialogItemQuantity() : 1;
    this.dialogDraftItems.update((items) => {
      const existingIndex = items.findIndex((i) => i.productId === product.id);
      if (existingIndex > -1) {
        const next = [...items];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + quantity
        };
        return next;
      }
      return [
        ...items,
        {
          id: '',
          productId: product.id,
          productName: product.name,
          quantity,
          price: this.dialogItemPrice()
        }
      ];
    });
    this.dialogProduct.set(null);
    this.dialogItemQuantity.set(1);
    this.calculateDialogTotal();
  }

  removeDialogItem(index: number): void {
    this.dialogDraftItems.update((items) => items.filter((_, i) => i !== index));
    this.calculateDialogTotal();
  }

  calculateDialogTotal(): void {
    const total = this.dialogDraftItems().reduce((acc, item) => acc + item.price * item.quantity, 0);
    this.dialogTotalAmount.set(total);
  }

  submitQuickCreate(): void {
    const customerId = this.dialogCustomer()?.id?.trim();
    if (!customerId) {
      this.messageService.add({ severity: 'warn', summary: 'Customer required', detail: 'Please search and select a customer.' });
      return;
    }
    if (!this.dialogDraftItems().length) {
      this.messageService.add({ severity: 'warn', summary: 'Items required', detail: 'Add at least one product.' });
      return;
    }

    this.saving.set(true);
    this.ordersApi
      .createOrder({
        CustomerId: customerId,
        Items: draftItemsToLineItems(this.dialogDraftItems()),
        PaymentType: this.dialogPaymentType()
      })
      .pipe(
        take(1),
        finalize(() => this.saving.set(false))
      )
      .subscribe({
        next: (res) => {
          if (!res.isSuccess || !res.result) {
            this.messageService.add(presentApiError(res.error).toast);
            return;
          }
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Order created successfully!' });
          this.createDialogVisible.set(false);
          this.ordersResource.reload();
          void this.router.navigate([res.result.id], { relativeTo: this.route });
        },
        error: (err: unknown) => {
          this.messageService.add(presentApiError(err).toast);
        }
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

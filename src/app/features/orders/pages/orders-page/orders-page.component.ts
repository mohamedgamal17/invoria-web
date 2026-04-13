import { CommonModule } from '@angular/common';
import { Component, computed, inject, linkedSignal, model, signal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, finalize, map, Observable, of, take, throwError } from 'rxjs';

import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';

import type { PagingInfo } from '../../../../core/models/paging';
import type { ApiResponse } from '../../../../core/models/api-response';
import type { Order } from '../../models/order.entity';
import { OrderStatus } from '../../models/order.entity';
import type { ListOrderRequest } from '../../models/list-order.request';
import type { UiOrder, UiOrderItem } from '../../models/order-ui.model';
import { draftItemsToLineItems, orderToUiOrder } from '../../models/order-ui.mapper';
import {
  canAccept,
  canCancel,
  canComplete,
  canEditOrder,
  canRefuse,
  canReopen
} from '../../models/order-actions';
import { OrdersApiService } from '../../services/orders-api.service';
import { OrderDialogComponent } from '../../components/order-dialog/order-dialog.component';
import { OrderHeaderComponent } from '../../components/order-header/order-header.component';
import { OrderListComponent } from '../../components/order-list/order-list.component';
import { OrderReasonDialogComponent } from '../../components/order-reason-dialog/order-reason-dialog.component';
import { CustomersApiService } from '../../../customers/services/customers-api.service';
import { customerSearchListRequest } from '../../../customers/models/list-customer.request';
import type { Customer } from '../../../customers/models/customer.entity';
import type { Product } from '../../../products/models/product.entity';
import { productSearchListRequest } from '../../../products/models/list-product.request';
import { ProductsApiService } from '../../../products/services/products-api.service';
import { formatApiError } from '../../../../core/http/api-error.format';

type OrderDraft = {
  orderNumber: string;
  customerName: string;
  totalAmount: number;
  orderDate: Date;
};

type ModalMode = 'create' | 'edit';

const EMPTY_ORDERS_TUPLE: [UiOrder[], PagingInfo] = [
  [],
  { length: 0, skip: 0, totalCount: 0 }
];

@Component({
  selector: 'app-orders-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ToastModule,
    OrderHeaderComponent,
    OrderListComponent,
    OrderDialogComponent,
    OrderReasonDialogComponent,
    ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './orders-page.component.html'
})
export class OrdersPageComponent {
  readonly pageSizeOptions = [25, 50, 100, 200];

  private readonly ordersApi = inject(OrdersApiService);
  private readonly productsApi = inject(ProductsApiService);
  private readonly customersApi = inject(CustomersApiService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
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

  /** 0-based page index derived from the URL. */
  readonly pageIndex = computed(() => Math.max(0, this.pageFromRoute() - 1));

  readonly first = computed(() => this.pageIndex() * this.pageSize());

  readonly listRequest = computed(
    (): ListOrderRequest => ({
      Skip: this.pageIndex() * this.pageSize(),
      Length: this.pageSize(),
      IncludeOrderItems: true
    })
  );

  readonly ordersResource = rxResource<[UiOrder[], PagingInfo], ListOrderRequest>({
    params: () => this.listRequest(),
    defaultValue: EMPTY_ORDERS_TUPLE,
    stream: ({ params }) =>
      this.ordersApi.listOrders(params).pipe(
        map((res) => {
          if (!res.isSuccess || !res.result) {
            const detail = this.formatApiFailureDetail(res.error);
            this.messageService.add({ severity: 'error', summary: 'Error', detail });
            return EMPTY_ORDERS_TUPLE;
          }
          const uiRows = res.result.data.map(orderToUiOrder);
          return [uiRows, res.result.info] as [UiOrder[], PagingInfo];
        }),
        catchError((err: unknown) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: formatApiError(err) });
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

  /** Two-way with `app-order-dialog` via `[(visible)]`. */
  modalVisible = model(false);
  modalMode = signal<ModalMode>('create');
  modalSaving = signal(false);
  private readonly editingId = signal<string | null>(null);

  reasonModalVisible = model(false);
  reasonText = model('');
  reasonSaving = signal(false);
  protected transitionTarget = signal<{ order: UiOrder; state: OrderStatus } | null>(null);

  draft = signal<OrderDraft>({
    orderNumber: '',
    customerName: '',
    totalAmount: 0,
    orderDate: new Date()
  });

  products = signal<Product[]>([]);
  selectedProduct = model<Product | null>(null);
  itemQuantity = model(1);
  itemPrice = model(0);
  draftItems = signal<UiOrderItem[]>([]);
  isProductLoading = signal<boolean>(false);

  customers = signal<Customer[]>([]);
  selectedCustomer = model<Customer | null>(null);
  isCustomerLoading = signal<boolean>(false);

  totalItemsCount = computed(() => this.draftItems().reduce((acc, item) => acc + item.quantity, 0));

  openCreateModal(): void {
    this.modalMode.set('create');
    this.editingId.set(null);
    this.draft.set({
      orderNumber: `ORD-${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`,
      customerName: '',
      totalAmount: 0,
      orderDate: new Date()
    });
    this.draftItems.set([]);
    this.selectedProduct.set(null);
    this.selectedCustomer.set(null);
    this.itemQuantity.set(1);
    this.itemPrice.set(0);
    this.modalVisible.set(true);
  }

  canEdit(order: UiOrder): boolean {
    return canEditOrder(order);
  }

  canAccept(order: UiOrder): boolean {
    return canAccept(order);
  }

  canCancel(order: UiOrder): boolean {
    return canCancel(order);
  }

  canReopen(order: UiOrder): boolean {
    return canReopen(order);
  }

  canComplete(order: UiOrder): boolean {
    return canComplete(order);
  }

  canRefuse(order: UiOrder): boolean {
    return canRefuse(order);
  }

  /**
   * Maps UI target states to HTTP endpoints. Cancel/refuse reason text is not sent in the
   * request body until the API contract and {@link OrdersApiService} accept it.
   */
  transitionState(order: UiOrder, targetState: OrderStatus, reason?: string): void {
    if (targetState === OrderStatus.Completed && !this.canComplete(order)) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Invalid transition',
        detail: 'Order can be completed only after it is accepted and dispatched.'
      });
      return;
    }

    if ([OrderStatus.Cancelled, OrderStatus.Refused].includes(targetState) && !reason) {
      this.transitionTarget.set({ order, state: targetState });
      this.reasonText.set('');
      this.reasonModalVisible.set(true);
      return;
    }

    const actionMap: Record<number, string> = {
      [OrderStatus.Accepted]: 'accept',
      [OrderStatus.Reopened]: 'reopen',
      [OrderStatus.Completed]: 'complete',
      [OrderStatus.Cancelled]: 'cancel',
      [OrderStatus.Refused]: 'refuse'
    };

    const action = actionMap[targetState] || 'update';

    this.confirmationService.confirm({
      message: `Are you sure you want to ${action} order "${order.orderNumber}"?`,
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { label: 'Confirm', severity: 'primary' },
      rejectButtonProps: { label: 'Cancel', severity: 'secondary', outlined: true },
      accept: () => {
        this.transitionOrderRequest(order.id, targetState)
          .pipe(take(1))
          .subscribe({
            next: (res) => {
              if (!res.isSuccess || res.result === undefined) {
                const detail = this.formatApiFailureDetail(res.error);
                this.messageService.add({ severity: 'error', summary: 'Error', detail });
                return;
              }
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Order updated successfully.'
              });
              this.patchOrderRowFromApi(res.result);
            },
            error: (err: unknown) => {
              this.messageService.add({ severity: 'error', summary: 'Error', detail: formatApiError(err) });
            }
          });
      }
    });
  }

  dispatchOrder(order: UiOrder): void {
    this.confirmationService.confirm({
      message: `Dispatch order "${order.orderNumber}" now?`,
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { label: 'Dispatch', severity: 'primary' },
      rejectButtonProps: { label: 'Cancel', severity: 'secondary', outlined: true },
      accept: () => {
        this.ordersApi
          .dispatchOrder(order.id)
          .pipe(take(1))
          .subscribe({
            next: (res) => {
              if (!res.isSuccess || res.result === undefined) {
                const detail = this.formatApiFailureDetail(res.error);
                this.messageService.add({ severity: 'error', summary: 'Error', detail });
                return;
              }
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Order dispatched successfully.'
              });
              this.patchOrderRowFromApi(res.result);
            },
            error: (err: unknown) => {
              this.messageService.add({ severity: 'error', summary: 'Error', detail: formatApiError(err) });
            }
          });
      }
    });
  }

  submitReason(): void {
    const target = this.transitionTarget();
    if (!target || !this.reasonText().trim()) return;

    this.reasonSaving.set(true);
    this.transitionOrderRequest(target.order.id, target.state)
      .pipe(
        take(1),
        finalize(() => this.reasonSaving.set(false))
      )
      .subscribe({
        next: (res) => {
          if (!res.isSuccess || res.result === undefined) {
            const detail = this.formatApiFailureDetail(res.error);
            this.messageService.add({ severity: 'error', summary: 'Error', detail });
            return;
          }
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Order updated successfully.'
          });
          this.reasonModalVisible.set(false);
          this.patchOrderRowFromApi(res.result);
        },
        error: (err: unknown) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: formatApiError(err) });
        }
      });
  }

  openEditModal(order: UiOrder): void {
    if (!this.canEdit(order)) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Edit Restricted',
        detail: `Order cannot be modified in "${order.status}" state.`
      });
      return;
    }

    this.ordersApi
      .getOrder(order.id)
      .pipe(take(1))
      .subscribe({
        next: (res) => {
          if (!res.isSuccess || res.result === undefined) {
            const detail = this.formatApiFailureDetail(res.error);
            this.messageService.add({ severity: 'error', summary: 'Error', detail });
            return;
          }
          const full = orderToUiOrder(res.result);
          this.modalMode.set('edit');
          this.editingId.set(full.id);
          this.draft.set({
            orderNumber: full.orderNumber,
            customerName: full.customerName,
            totalAmount: full.totalAmount,
            orderDate: new Date(full.orderDate)
          });
          this.draftItems.set([...(full.items || [])]);
          this.selectedProduct.set(null);
          this.selectedCustomer.set(
            full.customerId
              ? ({
                  id: full.customerId,
                  name: full.customerName,
                  createdAt: full.createdAt
                } satisfies Customer)
              : null
          );
          this.itemQuantity.set(1);
          this.itemPrice.set(0);
          this.modalVisible.set(true);
        },
        error: (err: unknown) => {
          const message = err instanceof Error ? err.message : 'Unexpected error.';
          this.messageService.add({ severity: 'error', summary: 'Error', detail: message });
        }
      });
  }

  onModalHide(): void {
    this.modalSaving.set(false);
  }

  submitModal(): void {
    if (this.modalSaving()) {
      return;
    }
    this.modalSaving.set(true);

    const customer = this.selectedCustomer();
    const items = this.draftItems();

    if (this.modalMode() === 'create') {
      const customerId = customer?.id?.trim();
      if (!customerId) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Customer required',
          detail: 'Please search and select a customer.'
        });
        this.modalSaving.set(false);
        return;
      }
      if (!items.length) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Items required',
          detail: 'Add at least one line item.'
        });
        this.modalSaving.set(false);
        return;
      }

      this.ordersApi
        .createOrder({ CustomerId: customerId, Items: draftItemsToLineItems(items) })
        .pipe(
          take(1),
          finalize(() => this.modalSaving.set(false))
        )
        .subscribe({
          next: (res) => {
            if (!res.isSuccess || res.result === undefined) {
              const detail = this.formatApiFailureDetail(res.error);
              this.messageService.add({ severity: 'error', summary: 'Error', detail });
              return;
            }
            const created = orderToUiOrder(res.result);
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Order created successfully.'
            });
            this.modalVisible.set(false);

            if (this.pageIndex() === 0) {
              this.prependCreatedOrderOnFirstPage(created);
            }
            void this.router.navigate([], {
              relativeTo: this.route,
              queryParams: { page: 1 },
              queryParamsHandling: 'merge'
            });
          },
          error: (err: unknown) => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: formatApiError(err) });
          }
        });
      return;
    }

    const id = this.editingId();
    if (!id) {
      this.modalSaving.set(false);
      return;
    }
    if (!items.length) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Items required',
        detail: 'Add at least one line item.'
      });
      this.modalSaving.set(false);
      return;
    }

    this.ordersApi
      .updateOrderItems(id, { Items: draftItemsToLineItems(items) })
      .pipe(
        take(1),
        finalize(() => this.modalSaving.set(false))
      )
      .subscribe({
        next: (res) => {
          if (!res.isSuccess || res.result === undefined) {
            const detail = this.formatApiFailureDetail(res.error);
            this.messageService.add({ severity: 'error', summary: 'Error', detail });
            return;
          }
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Order updated successfully.'
          });
          this.modalVisible.set(false);
          this.patchOrderRowFromApi(res.result);
        },
        error: (err: unknown) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: formatApiError(err) });
        }
      });
  }

  closeModal(): void {
    this.modalVisible.set(false);
  }

  searchProducts(event: { query: string }): void {
    this.isProductLoading.set(true);
    this.productsApi
      .searchProducts(productSearchListRequest, event.query)
      .pipe(take(1))
      .subscribe({
        next: (products) => {
          this.products.set(products);
          this.isProductLoading.set(false);
        },
        error: () => {
          this.products.set([]);
          this.isProductLoading.set(false);
        }
      });
  }

  searchCustomers(event: { query: string }): void {
    this.isCustomerLoading.set(true);
    this.customersApi
      .searchCustomers(customerSearchListRequest, event.query)
      .pipe(take(1))
      .subscribe({
        next: (customers) => {
          this.customers.set(customers);
          this.isCustomerLoading.set(false);
        },
        error: () => {
          this.customers.set([]);
          this.isCustomerLoading.set(false);
        }
      });
  }

  onCustomerSelect(event: unknown): void {
    const customer =
      event && typeof event === 'object' && 'value' in event
        ? (event as { value?: Customer }).value
        : (event as Customer);
    if (!customer?.id) return;
    this.selectedCustomer.set(customer);
    this.draft.update((d) => ({ ...d, customerName: customer.name }));
  }

  clearCustomerSelection(): void {
    this.selectedCustomer.set(null);
    this.draft.update((d) => ({ ...d, customerName: '' }));
  }

  onProductSelect(event: unknown): void {
    const product =
      event && typeof event === 'object' && 'value' in event
        ? (event as { value?: Product }).value
        : (event as Product);
    if (!product?.id) return;
    this.selectedProduct.set(product);
    this.itemQuantity.set(1);
    this.itemPrice.set(product.price);
  }

  clearProductSelection(): void {
    this.selectedProduct.set(null);
    this.itemQuantity.set(1);
    this.itemPrice.set(0);
  }

  addItem(): void {
    const product = this.selectedProduct();
    if (!product) {
      this.messageService.add({
        severity: 'warn',
        summary: 'No Product Selected',
        detail: 'Please selection a product from the list.'
      });
      return;
    }

    let quantity = this.itemQuantity();
    if (!quantity || quantity <= 0) {
      quantity = 1;
      this.itemQuantity.set(1);
    }

    this.draftItems.update((items) => {
      const existingIndex = items.findIndex((i) => i.productId === product.id);
      if (existingIndex > -1) {
        const newItems = [...items];
        newItems[existingIndex] = {
          ...newItems[existingIndex],
          quantity: newItems[existingIndex].quantity + quantity
        };
        return newItems;
      }
      return [
        ...items,
        {
          productId: product.id,
          productName: product.name,
          quantity,
          price: this.itemPrice()
        }
      ];
    });

    this.selectedProduct.set(null);
    this.itemQuantity.set(1);
    this.calculateTotal();
  }

  removeItem(index: number): void {
    this.draftItems.update((items) => items.filter((_, i) => i !== index));
    this.calculateTotal();
  }

  protected calculateTotal(): void {
    const total = this.draftItems().reduce((acc, item) => acc + item.price * item.quantity, 0);
    this.draft.update((d) => ({ ...d, totalAmount: total }));
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

  private patchOrderRowFromApi(order: Order): void {
    const ui = orderToUiOrder(order);
    this.displayOrders.update((rows) => rows.map((o) => (o.id === ui.id ? ui : o)));
  }

  /** Matches customers-page create: prepend on first page and bump total count. */
  private prependCreatedOrderOnFirstPage(created: UiOrder): void {
    const pageLen = this.pageSize();
    this.displayOrders.update((prev) =>
      prev.length >= pageLen ? [created, ...prev.slice(0, pageLen - 1)] : [created, ...prev]
    );
    this.displayPaging.update((p) => ({ ...p, totalCount: p.totalCount + 1 }));
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

  private transitionOrderRequest(id: string, target: OrderStatus): Observable<ApiResponse<Order>> {
    switch (target) {
      case OrderStatus.Accepted:
        return this.ordersApi.acceptOrder(id);
      case OrderStatus.Cancelled:
        return this.ordersApi.cancelOrder(id);
      case OrderStatus.Completed:
        return this.ordersApi.completeOrder(id);
      case OrderStatus.Refused:
        return this.ordersApi.refuseOrder(id);
      case OrderStatus.Reopened:
        return this.ordersApi.reopenOrder(id);
      default:
        return throwError(() => new Error(`Unsupported transition: ${target}`));
    }
  }

  private formatApiFailureDetail(error: unknown): string {
    return formatApiError(error);
  }
}

import { CommonModule } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import {
  EMPTY,
  Subject,
  catchError,
  debounceTime,
  distinctUntilChanged,
  finalize,
  map,
  of,
  switchMap,
  take,
  tap
} from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MessageService } from 'primeng/api';

import { OrdersApiService } from '../../services/orders-api.service';
import { Store } from '@ngrx/store';
import { ORDERS_LIST_ACTIONS } from '../../store/orders-list/orders-list.actions';
import {
  OrderFormComponent,
  type OrderFormSubmitEvent
} from '../../components/order-form/order-form.component';
import type { Customer } from '../../../customers/models/customer.entity';
import { customerSearchListRequest } from '../../../customers/models/list-customer.request';
import type { Product } from '../../../products/models/product.entity';
import { productSearchListRequest } from '../../../products/models/list-product.request';
import { CustomersApiService } from '../../../customers/services/customers-api.service';
import { ProductsApiService } from '../../../products/services/products-api.service';
import type { OrderItem } from '../../models/order.entity';
import { PaymentType } from '../../models/order-payment.enums';
import { draftItemsToLineItems, orderToUiOrder } from '../../models/order-ui.mapper';
import { presentApiError } from '../../../../core/http/api-error.presenter';
import { ApiHttpError } from '../../../../core/http/api-http-error';
import { SEARCH_DEBOUNCE_MS } from '../../../../shared/models/debounce';

@Component({
  selector: 'app-order-form-page',
  standalone: true,
  imports: [CommonModule, ButtonModule, CardModule, OrderFormComponent],
  templateUrl: './order-form-page.component.html'
})
export class OrderFormPageComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly ordersApi = inject(OrdersApiService);
  private readonly store = inject(Store);
  private readonly productsApi = inject(ProductsApiService);
  private readonly customersApi = inject(CustomersApiService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  private readonly productQuery$ = new Subject<string>();
  private readonly productSearchCache = new Map<string, Product[]>();
  private readonly customerQuery$ = new Subject<string>();

  readonly mode = computed<'create' | 'edit'>(() =>
    this.route.snapshot.data['mode'] === 'edit' ? 'edit' : 'create'
  );
  readonly orderId = computed(() => this.route.snapshot.paramMap.get('id'));

  loading = signal(false);
  saving = signal(false);
  orderNumber = signal('');
  totalAmount = signal(0);

  products = signal<Product[]>([]);
  isProductLoading = signal(false);

  customers = signal<Customer[]>([]);
  isCustomerLoading = signal(false);

  /** Form seeds for edit mode; the form owns the editable state afterwards. */
  initialCustomer = signal<Customer | null>(null);
  initialPaymentType = signal<PaymentType>(PaymentType.Immediate);
  initialItems = signal<OrderItem[]>([]);

  constructor() {
    this.productQuery$
      .pipe(
        debounceTime(SEARCH_DEBOUNCE_MS),
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
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((products) => this.products.set(products));

    this.customerQuery$
      .pipe(
        debounceTime(SEARCH_DEBOUNCE_MS),
        distinctUntilChanged(),
        switchMap((query) => {
          this.isCustomerLoading.set(true);
          return this.customersApi.searchCustomers(customerSearchListRequest, query).pipe(
            catchError(() => of([] as Customer[])),
            finalize(() => this.isCustomerLoading.set(false))
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((customers) => this.customers.set(customers));

    if (this.mode() === 'edit' && this.orderId()) {
      this.loadOrder(this.orderId() as string);
    }
  }

  goBack(): void {
    if (this.mode() === 'edit' && this.orderId()) {
      void this.router.navigate(['../../'], { relativeTo: this.route });
      return;
    }
    void this.router.navigate(['../'], { relativeTo: this.route });
  }

  submit(event: OrderFormSubmitEvent): void {
    if (this.saving()) {
      return;
    }

    if (this.mode() === 'create' && !event.customerId.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Customer required',
        detail: 'Please search and select a customer.'
      });
      return;
    }

    if (!event.items.length) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Items required',
        detail: 'Add at least one line item.'
      });
      return;
    }

    this.saving.set(true);
    if (this.mode() === 'create') {
      this.createOrder(event);
      return;
    }
    this.updateOrderItems(event);
  }

  onItemsChange(items: OrderItem[]): void {
    this.totalAmount.set(
      items.reduce((total, item) => total + item.price * item.quantity, 0)
    );
  }

  private createOrder(event: OrderFormSubmitEvent): void {
    this.ordersApi
      .createOrder({
        CustomerId: event.customerId,
        Items: draftItemsToLineItems(event.items),
        PaymentType: event.paymentType
      })
      .pipe(
        take(1),
        map((res) => {
          if (!res.isSuccess || !res.result) {
            throw res.error ? new ApiHttpError(res.error) : new Error('Failed to create order.');
          }
          return res.result;
        }),
        catchError((err: unknown) => {
          this.showCreateError(err);
          return EMPTY;
        }),
        finalize(() => this.saving.set(false))
      )
      .subscribe((result) => {
        this.store.dispatch(ORDERS_LIST_ACTIONS.orderCreated({ order: orderToUiOrder(result) }));
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Order created successfully.'
        });
        void this.router.navigate(['../', result.id], { relativeTo: this.route });
      });
  }

  private updateOrderItems(event: OrderFormSubmitEvent): void {
    this.ordersApi
      .updateOrderItems(this.orderId() as string, {
        Items: draftItemsToLineItems(event.items)
      })
      .pipe(
        take(1),
        finalize(() => this.saving.set(false))
      )
      .subscribe({
        next: (res) => {
          if (!res.isSuccess || !res.result) {
            this.messageService.add({ ...presentApiError(res.error).toast });
            return;
          }
          this.store.dispatch(
            ORDERS_LIST_ACTIONS.orderUpdated({ order: orderToUiOrder(res.result) })
          );
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Order updated successfully.'
          });
          void this.router.navigate(['../../', res.result.id], { relativeTo: this.route });
        },
        error: (err: unknown) => {
          this.messageService.add({ ...presentApiError(err).toast });
        }
      });
  }

  searchProducts(event: { query: string }): void {
    const query = (event.query ?? '').trim();
    const cached = this.productSearchCache.get(query);
    if (cached !== undefined) {
      this.products.set([...cached]);
      this.isProductLoading.set(false);
      return;
    }
    this.productQuery$.next(query);
  }

  searchCustomers(event: { query: string }): void {
    this.customerQuery$.next((event.query ?? '').trim());
  }

  private loadOrder(id: string): void {
    this.loading.set(true);
    this.ordersApi
      .getOrder(id)
      .pipe(
        take(1),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: (res) => {
          if (!res.isSuccess || !res.result) {
            this.messageService.add({ ...presentApiError(res.error).toast });
            return;
          }
          const full = orderToUiOrder(res.result);
          this.orderNumber.set(full.orderNumber);
          this.initialItems.set([...(full.items || [])]);
          this.totalAmount.set(full.netOfTotalOrderAmount);
          this.initialPaymentType.set(full.paymentType ?? PaymentType.Immediate);
          this.initialCustomer.set(
            full.customerId ? ({ id: full.customerId, name: full.customerName } as Customer) : null
          );
        },
        error: (err: unknown) => {
          this.messageService.add({ ...presentApiError(err).toast });
        }
      });
  }

  private showCreateError(err: unknown): void {
    this.messageService.add({ ...presentApiError(err).toast });
  }
}

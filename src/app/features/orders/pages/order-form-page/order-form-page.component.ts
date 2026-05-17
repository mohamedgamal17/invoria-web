import { CommonModule } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { EMPTY, Subject, catchError, debounceTime, distinctUntilChanged, finalize, map, of, switchMap, take } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MessageService } from 'primeng/api';

import { OrdersApiService } from '../../services/orders-api.service';
import { OrderFormComponent } from '../../components/order-form/order-form.component';
import type { Customer } from '../../../customers/models/customer.entity';
import { customerSearchListRequest } from '../../../customers/models/list-customer.request';
import type { Product } from '../../../products/models/product.entity';
import { productSearchListRequest } from '../../../products/models/list-product.request';
import { CustomersApiService } from '../../../customers/services/customers-api.service';
import { ProductsApiService } from '../../../products/services/products-api.service';
import type { UiOrderItem } from '../../models/order-ui.model';
import { PaymentType } from '../../models/order-payment.enums';
import { draftItemsToLineItems, orderToUiOrder } from '../../models/order-ui.mapper';
import { presentApiError } from '../../../../core/http/api-error.presenter';

/** Mirrors filter-panel name debounce (e.g. products-filter-panel). */
const ORDER_FORM_AUTOCOMPLETE_DEBOUNCE_MS = 700;

@Component({
  selector: 'app-order-form-page',
  standalone: true,
  imports: [CommonModule, ButtonModule, CardModule, OrderFormComponent],
  templateUrl: './order-form-page.component.html'
})
export class OrderFormPageComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly ordersApi = inject(OrdersApiService);
  private readonly productsApi = inject(ProductsApiService);
  private readonly customersApi = inject(CustomersApiService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  private readonly productQuery$ = new Subject<string>();
  private readonly customerQuery$ = new Subject<string>();

  readonly mode = computed<'create' | 'edit'>(() =>
    this.route.snapshot.data['mode'] === 'edit' ? 'edit' : 'create'
  );
  readonly orderId = computed(() => this.route.snapshot.paramMap.get('id'));

  loading = signal(false);
  saving = signal(false);
  orderNumber = signal('');
  totalAmount = signal(0);

  draftItems = signal<UiOrderItem[]>([]);
  products = signal<Product[]>([]);
  selectedProduct = signal<Product | null>(null);
  itemQuantity = signal(1);
  itemPrice = signal(0);
  isProductLoading = signal(false);

  customers = signal<Customer[]>([]);
  selectedCustomer = signal<Customer | null>(null);
  isCustomerLoading = signal(false);

  paymentType = signal<PaymentType>(PaymentType.Immediate);

  constructor() {
    this.productQuery$
      .pipe(
        debounceTime(ORDER_FORM_AUTOCOMPLETE_DEBOUNCE_MS),
        distinctUntilChanged(),
        switchMap((query) => {
          this.isProductLoading.set(true);
          return this.productsApi.searchProducts(productSearchListRequest, query).pipe(
            catchError(() => of([] as Product[])),
            finalize(() => this.isProductLoading.set(false))
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((products) => this.products.set(products));

    this.customerQuery$
      .pipe(
        debounceTime(ORDER_FORM_AUTOCOMPLETE_DEBOUNCE_MS),
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

  submit(): void {
    if (this.saving()) return;
    const customerId = this.selectedCustomer()?.id?.trim();
    if (!customerId && this.mode() === 'create') {
      this.messageService.add({
        severity: 'warn',
        summary: 'Customer required',
        detail: 'Please search and select a customer.'
      });
      return;
    }
    if (!this.draftItems().length) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Items required',
        detail: 'Add at least one line item.'
      });
      return;
    }

    this.saving.set(true);
    if (this.mode() === 'create') {
      this.ordersApi
        .createOrder({
          CustomerId: customerId as string,
          Items: draftItemsToLineItems(this.draftItems()),
          PaymentType: this.paymentType()
        })
        .pipe(
          take(1),
          map((res) => {
            if (!res.isSuccess || !res.result) {
              throw res.error ?? new Error('Failed to create order.');
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
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Order created successfully.' });
            void this.router.navigate(['../', result.id], { relativeTo: this.route });
        });
      return;
    }

    this.ordersApi
      .updateOrderItems(this.orderId() as string, { Items: draftItemsToLineItems(this.draftItems()) })
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
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Order updated successfully.' });
          void this.router.navigate(['../../', res.result.id], { relativeTo: this.route });
        },
        error: (err: unknown) => {
          this.messageService.add({ ...presentApiError(err).toast });
        }
      });
  }

  searchProducts(event: { query: string }): void {
    this.productQuery$.next((event.query ?? '').trim());
  }

  searchCustomers(event: { query: string }): void {
    this.customerQuery$.next((event.query ?? '').trim());
  }

  onCustomerSelect(event: unknown): void {
    const customer =
      event && typeof event === 'object' && 'value' in event
        ? (event as { value?: Customer }).value
        : (event as Customer);
    if (!customer?.id) return;
    this.selectedCustomer.set(customer);
  }

  clearCustomerSelection(): void {
    this.selectedCustomer.set(null);
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
    if (!product) return;
    const quantity = this.itemQuantity() > 0 ? this.itemQuantity() : 1;
    this.draftItems.update((items) => {
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
        { productId: product.id, productName: product.name, quantity, price: this.itemPrice() }
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

  calculateTotal(): void {
    const total = this.draftItems().reduce((acc, item) => acc + item.price * item.quantity, 0);
    this.totalAmount.set(total);
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
          this.draftItems.set([...(full.items || [])]);
          this.totalAmount.set(full.totalAmount);
          this.paymentType.set(full.paymentType ?? PaymentType.Immediate);
          this.selectedCustomer.set(
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

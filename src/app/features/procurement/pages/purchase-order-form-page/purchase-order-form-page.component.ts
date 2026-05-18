import { CommonModule } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import {
  Subject,
  catchError,
  debounceTime,
  finalize,
  forkJoin,
  map,
  of,
  switchMap,
  take,
  tap
} from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

import { presentApiError } from '../../../../core/http/api-error.presenter';
import { canEditPurchaseOrder } from '../../models/purchase-order-actions';
import type { CreatePurchaseOrderRequest } from '../../models/create-purchase-order.request';
import type {
  PurchaseOrder,
  PurchaseOrderItem,
  PurchaseOrderSupplierRef
} from '../../models/purchase-order.entity';
import {
  draftItemsToPurchaseOrderLineItems,
  purchaseOrderItemToUiItem
} from '../../models/purchase-order-ui.mapper';
import type { UiPurchaseOrderItem } from '../../models/purchase-order-ui.model';
import { PurchaseOrdersApiService } from '../../services/purchase-orders-api.service';
import { PurchaseOrderFormComponent } from '../../components/purchase-order-form/purchase-order-form.component';
import type { Product } from '../../../products/models/product.entity';
import { productSearchListRequest } from '../../../products/models/list-product.request';
import { ProductsApiService } from '../../../products/services/products-api.service';

/** Mirrors order-form-page product autocomplete debounce. */
const PO_FORM_AUTOCOMPLETE_DEBOUNCE_MS = 700;

@Component({
  selector: 'app-purchase-order-form-page',
  standalone: true,
  imports: [CommonModule, ButtonModule, CardModule, ToastModule, PurchaseOrderFormComponent],
  providers: [MessageService],
  templateUrl: './purchase-order-form-page.component.html'
})
export class PurchaseOrderFormPageComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly api = inject(PurchaseOrdersApiService);
  private readonly productsApi = inject(ProductsApiService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  private readonly productQuery$ = new Subject<string>();
  private readonly productSearchCache = new Map<string, Product[]>();

  readonly mode = computed<'create' | 'edit'>(() =>
    this.route.snapshot.data['mode'] === 'edit' ? 'edit' : 'create'
  );

  readonly purchaseOrderId = computed(() => this.route.snapshot.paramMap.get('id'));

  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly purchaseNumber = signal('');
  readonly subTotal = signal(0);
  readonly supplierDisplayRef = signal<PurchaseOrderSupplierRef | null>(null);

  readonly supplierId = signal('');
  readonly taxAmount = signal(0);
  readonly discountAmount = signal(0);
  readonly orderDate = signal('');
  readonly expectedDeliveryDate = signal('');

  readonly draftItems = signal<UiPurchaseOrderItem[]>([]);
  readonly products = signal<Product[]>([]);
  readonly selectedProduct = signal<Product | null>(null);
  readonly itemQuantity = signal(1);
  readonly itemUnitPrice = signal(0);
  readonly itemSupplierProductCode = signal('');
  readonly isProductLoading = signal(false);

  constructor() {
    this.productQuery$
      .pipe(
        debounceTime(PO_FORM_AUTOCOMPLETE_DEBOUNCE_MS),
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

    if (this.mode() === 'edit' && this.purchaseOrderId()) {
      this.loadPurchaseOrder(this.purchaseOrderId() as string);
    }
  }

  goBack(): void {
    if (this.mode() === 'edit' && this.purchaseOrderId()) {
      void this.router.navigate(['/procurement', this.purchaseOrderId()]);
      return;
    }
    void this.router.navigate(['/procurement']);
  }

  submit(): void {
    if (this.saving()) {
      return;
    }

    const supplierId = this.supplierId().trim();
    if (!supplierId) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Supplier required',
        detail: 'Please search and select a supplier.'
      });
      return;
    }

    const itemsError = this.validateDraftItems();
    if (itemsError) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation',
        detail: itemsError
      });
      return;
    }

    if (this.taxAmount() < 0 || this.discountAmount() < 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation',
        detail: 'Tax and discount must be zero or greater.'
      });
      return;
    }

    let body: CreatePurchaseOrderRequest;
    try {
      body = this.buildRequestBody();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Invalid form.';
      this.messageService.add({ severity: 'warn', summary: 'Validation', detail: msg });
      return;
    }

    this.saving.set(true);
    const mode = this.mode();
    const id = this.purchaseOrderId();

    if (mode === 'create') {
      this.api
        .createPurchaseOrder(body)
        .pipe(
          take(1),
          finalize(() => this.saving.set(false))
        )
        .subscribe({
          next: (res) => {
            if (!res.isSuccess || !res.result) {
              this.messageService.add({
                ...presentApiError(res.error).toast
              });
              return;
            }
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Purchase order created.'
            });
            void this.router.navigate(['/procurement', res.result.id]);
          },
          error: (err: unknown) => {
            this.messageService.add({ ...presentApiError(err).toast });
          }
        });
      return;
    }

    if (!id) {
      this.saving.set(false);
      return;
    }

    this.api
      .updatePurchaseOrder(id, body)
      .pipe(
        take(1),
        finalize(() => this.saving.set(false))
      )
      .subscribe({
        next: (res) => {
          if (!res.isSuccess || !res.result) {
            this.messageService.add({
              ...presentApiError(res.error).toast
            });
            return;
          }
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Purchase order updated.'
          });
          void this.router.navigate(['/procurement', id]);
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

  onProductSelect(event: unknown): void {
    const product =
      event && typeof event === 'object' && 'value' in event
        ? (event as { value?: Product }).value
        : (event as Product);
    if (!product?.id) {
      return;
    }
    this.selectedProduct.set(product);
    this.itemQuantity.set(1);
    this.itemUnitPrice.set(product.price > 0 ? product.price : 0.01);
    this.itemSupplierProductCode.set('');
  }

  clearProductSelection(): void {
    this.selectedProduct.set(null);
    this.itemQuantity.set(1);
    this.itemUnitPrice.set(0);
    this.itemSupplierProductCode.set('');
  }

  addItem(): void {
    const product = this.selectedProduct();
    if (!product) {
      return;
    }

    const quantity = this.itemQuantity() > 0 ? this.itemQuantity() : 1;
    const unitPrice = this.itemUnitPrice();
    if (unitPrice <= 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation',
        detail: 'Unit price must be greater than zero.'
      });
      return;
    }

    const supplierCode = this.itemSupplierProductCode().trim() || null;

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
        {
          productId: product.id,
          productName: product.name,
          quantity,
          unitPrice,
          supplierProductCode: supplierCode
        }
      ];
    });

    this.selectedProduct.set(null);
    this.itemQuantity.set(1);
    this.itemUnitPrice.set(0);
    this.itemSupplierProductCode.set('');
    this.calculateSubTotal();
  }

  removeItem(index: number): void {
    this.draftItems.update((items) => items.filter((_, i) => i !== index));
    this.calculateSubTotal();
  }

  calculateSubTotal(): void {
    const total = this.draftItems().reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
    this.subTotal.set(total);
  }

  private validateDraftItems(): string | null {
    if (!this.draftItems().length) {
      return 'Add at least one line item.';
    }
    for (const item of this.draftItems()) {
      if (item.quantity <= 0) {
        return 'Quantity must be greater than zero.';
      }
      if (item.unitPrice <= 0) {
        return 'Unit price must be greater than zero.';
      }
    }
    return null;
  }

  private buildRequestBody(): CreatePurchaseOrderRequest {
    return {
      SupplierId: this.supplierId().trim(),
      TaxAmount: this.taxAmount(),
      DiscountAmount: this.discountAmount(),
      OrderDate: this.normalizeOptionalDate(this.orderDate()),
      ExpectedDeliveryDate: this.normalizeOptionalDate(this.expectedDeliveryDate()),
      PurchaseOrderItems: draftItemsToPurchaseOrderLineItems(this.draftItems())
    };
  }

  private normalizeOptionalDate(value: string): string | null | undefined {
    const v = (value || '').trim();
    if (!v) {
      return undefined;
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(v)) {
      return `${v}T00:00:00.000Z`;
    }
    return v;
  }

  private loadPurchaseOrder(id: string): void {
    this.loading.set(true);
    this.api
      .getPurchaseOrder(id)
      .pipe(take(1), finalize(() => this.loading.set(false)))
      .subscribe({
        next: (res) => {
          if (!res.isSuccess || !res.result) {
            this.messageService.add({
              ...presentApiError(res.error).toast
            });
            void this.router.navigate(['/procurement']);
            return;
          }
          const po = res.result;
          if (!canEditPurchaseOrder(po.state)) {
            this.messageService.add({
              severity: 'warn',
              summary: 'Cannot edit',
              detail: 'Purchase orders can only be edited in Draft or Reopened state.'
            });
            void this.router.navigate(['/procurement', id]);
            return;
          }
          this.patchFromPurchaseOrder(po);
        },
        error: (err: unknown) => {
          this.messageService.add({ ...presentApiError(err).toast });
          void this.router.navigate(['/procurement']);
        }
      });
  }

  private patchFromPurchaseOrder(po: PurchaseOrder): void {
    const lines = po.purchaseOrderItems?.length ? po.purchaseOrderItems : [];
    const uiItems = lines.map(purchaseOrderItemToUiItem);
    this.draftItems.set(uiItems);
    this.calculateSubTotal();

    this.purchaseNumber.set(po.purchaseNumber);
    this.supplierId.set(po.supplierId);
    this.taxAmount.set(po.taxAmount);
    this.discountAmount.set(po.discountAmount);
    this.orderDate.set(this.toDateInputValue(po.orderDate));
    this.expectedDeliveryDate.set(this.toDateInputValue(po.expectedDeliveryDate));
    this.supplierDisplayRef.set(
      po.supplier && po.supplier.id === po.supplierId ? po.supplier : null
    );

    this.resolveMissingProductNames(lines, uiItems);
  }

  private resolveMissingProductNames(
    lines: PurchaseOrderItem[],
    uiItems: UiPurchaseOrderItem[]
  ): void {
    const needsName = lines.filter((l) => !l.productName?.trim()).map((l) => l.productId);
    const uniqueIds = [...new Set(needsName.filter(Boolean))];
    if (uniqueIds.length === 0) {
      return;
    }

    forkJoin(
      uniqueIds.map((productId) =>
        this.productsApi.getProduct(productId).pipe(
          map((res) => {
            const name =
              res.isSuccess && res.result?.name?.trim() ? res.result.name.trim() : productId;
            return { productId, name };
          }),
          catchError(() => of({ productId, name: productId }))
        )
      )
    )
      .pipe(take(1))
      .subscribe((rows) => {
        const nameById = new Map(rows.map((r) => [r.productId, r.name]));
        this.draftItems.set(
          uiItems.map((item) => {
            const resolved = nameById.get(item.productId);
            if (!resolved || resolved === item.productId) {
              return item;
            }
            return { ...item, productName: resolved };
          })
        );
      });
  }

  private toDateInputValue(iso: string | null | undefined): string {
    if (!iso) {
      return '';
    }
    const d = iso.slice(0, 10);
    return /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : '';
  }
}

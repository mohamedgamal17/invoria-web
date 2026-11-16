import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
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
import { SEARCH_DEBOUNCE_MS } from '../../../../shared/models/debounce';
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
import {
  PurchaseOrderFormComponent,
  type PurchaseOrderFormSubmitEvent
} from '../../components/purchase-order-form/purchase-order-form.component';
import type { Product } from '../../../products/models/product.entity';
import { productSearchListRequest } from '../../../products/models/list-product.request';
import { ProductsApiService } from '../../../products/services/products-api.service';
import type { SupplierChoice } from '../../../suppliers/models/supplier.entity';
import { supplierSearchListRequest } from '../../../suppliers/models/list-supplier.request';
import { SuppliersApiService } from '../../../suppliers/services/suppliers-api.service';

@Component({
  selector: 'app-purchase-order-form-page',
  standalone: true,
  imports: [CommonModule, ButtonModule, CardModule, ToastModule, PurchaseOrderFormComponent],
  providers: [MessageService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './purchase-order-form-page.component.html'
})
export class PurchaseOrderFormPageComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly api = inject(PurchaseOrdersApiService);
  private readonly productsApi = inject(ProductsApiService);
  private readonly suppliersApi = inject(SuppliersApiService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  private readonly productQuery$ = new Subject<string>();
  private readonly productSearchCache = new Map<string, Product[]>();
  private readonly supplierQuery$ = new Subject<string>();
  private readonly supplierSearchCache = new Map<string, SupplierChoice[]>();

  readonly mode = computed<'create' | 'edit'>(() =>
    this.route.snapshot.data['mode'] === 'edit' ? 'edit' : 'create'
  );

  readonly purchaseOrderId = computed(() => this.route.snapshot.paramMap.get('id'));

  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly purchaseNumber = signal('');
  readonly supplierDisplayRef = signal<PurchaseOrderSupplierRef | null>(null);

  /** Form seed for edit mode; the form owns the line items afterwards. */
  readonly initialItems = signal<UiPurchaseOrderItem[]>([]);
  readonly products = signal<Product[]>([]);
  readonly suppliers = signal<SupplierChoice[]>([]);
  readonly isProductLoading = signal(false);

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

    this.supplierQuery$
      .pipe(
        debounceTime(SEARCH_DEBOUNCE_MS),
        switchMap((query) => {
          const cached = this.supplierSearchCache.get(query);
          if (cached !== undefined) {
            return of(cached);
          }
          return this.suppliersApi.searchSuppliers(supplierSearchListRequest, query).pipe(
            tap((rows) => this.supplierSearchCache.set(query, rows)),
            catchError(() => of([] as SupplierChoice[]))
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((suppliers) => this.suppliers.set(suppliers));

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

  submit(event: PurchaseOrderFormSubmitEvent): void {
    if (this.saving()) {
      return;
    }

    const supplierId = event.supplierId.trim();
    if (!supplierId) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Supplier required',
        detail: 'Please search and select a supplier.'
      });
      return;
    }

    const body: CreatePurchaseOrderRequest = {
      SupplierId: supplierId,
      PurchaseOrderItems: draftItemsToPurchaseOrderLineItems(event.items)
    };

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
          next: (response) => {
            if (!response.isSuccess || !response.result) {
              this.messageService.add({
                ...presentApiError(response.error).toast
              });
              return;
            }
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Purchase order created.'
            });
            void this.router.navigate(['/procurement', response.result.id]);
          },
          error: (error: unknown) => {
            this.messageService.add({ ...presentApiError(error).toast });
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
        next: (response) => {
          if (!response.isSuccess || !response.result) {
            this.messageService.add({
              ...presentApiError(response.error).toast
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
        error: (error: unknown) => {
          this.messageService.add({ ...presentApiError(error).toast });
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

  searchSuppliers(event: { query: string }): void {
    const query = (event.query ?? '').trim();
    const cached = this.supplierSearchCache.get(query);
    if (cached !== undefined) {
      this.suppliers.set([...cached]);
      return;
    }
    this.supplierQuery$.next(query);
  }

  private loadPurchaseOrder(id: string): void {
    this.loading.set(true);
    this.api
      .getPurchaseOrder(id)
      .pipe(take(1), finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          if (!response.isSuccess || !response.result) {
            this.messageService.add({
              ...presentApiError(response.error).toast
            });
            void this.router.navigate(['/procurement']);
            return;
          }
          const po = response.result;
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
        error: (error: unknown) => {
          this.messageService.add({ ...presentApiError(error).toast });
          void this.router.navigate(['/procurement']);
        }
      });
  }

  private patchFromPurchaseOrder(po: PurchaseOrder): void {
    const lines = po.purchaseOrderItems?.length ? po.purchaseOrderItems : [];
    const uiItems = lines.map(purchaseOrderItemToUiItem);
    this.initialItems.set(uiItems);

    this.purchaseNumber.set(po.purchaseNumber);
    this.supplierDisplayRef.set(
      po.supplier && po.supplier.id === po.supplierId ? po.supplier : null
    );

    this.resolveMissingProductNames(lines, uiItems);
  }

  private resolveMissingProductNames(
    lines: PurchaseOrderItem[],
    uiItems: UiPurchaseOrderItem[]
  ): void {
    const missingNames = lines
      .filter((line) => !line.productName?.trim())
      .map((line) => line.productId);
    const uniqueIds = [...new Set(missingNames.filter(Boolean))];
    if (uniqueIds.length === 0) {
      return;
    }

    forkJoin(
      uniqueIds.map((productId) =>
        this.productsApi.getProduct(productId).pipe(
          map((response) => {
            const name =
              response.isSuccess && response.result?.name?.trim() ? response.result.name.trim() : productId;
            return { productId, name };
          }),
          catchError(() => of({ productId, name: productId }))
        )
      )
    )
      .pipe(take(1))
      .subscribe((rows) => {
        const nameById = new Map(rows.map((row) => [row.productId, row.name]));
        this.initialItems.set(
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
}

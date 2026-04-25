import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, take } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

import { presentApiError } from '../../../../core/http/api-error.presenter';
import { canEditPurchaseOrder } from '../../models/purchase-order-actions';
import type { CreatePurchaseOrderRequest } from '../../models/create-purchase-order.request';
import type { PurchaseOrder, PurchaseOrderSupplierRef } from '../../models/purchase-order.entity';
import { PurchaseOrdersApiService } from '../../services/purchase-orders-api.service';
import { SupplierIdControlComponent } from '../../components/supplier-id-control/supplier-id-control.component';
import { ProductIdControlComponent } from '../../components/product-id-control/product-id-control.component';

@Component({
  selector: 'app-purchase-order-form-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    InputNumberModule,
    MessageModule,
    ToastModule,
    SupplierIdControlComponent,
    ProductIdControlComponent
  ],
  providers: [MessageService],
  templateUrl: './purchase-order-form-page.component.html'
})
export class PurchaseOrderFormPageComponent {
  private readonly api = inject(PurchaseOrdersApiService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly formBuilder = inject(FormBuilder);

  readonly mode = computed<'create' | 'edit'>(() =>
    this.route.snapshot.data['mode'] === 'edit' ? 'edit' : 'create'
  );

  readonly purchaseOrderId = computed(() => this.route.snapshot.paramMap.get('id'));

  readonly loading = signal(false);
  readonly saving = signal(false);
  /** Passed to supplier picker in edit mode when API included supplier on the PO. */
  readonly supplierDisplayRef = signal<PurchaseOrderSupplierRef | null>(null);

  readonly form = this.formBuilder.group({
    supplierId: this.formBuilder.nonNullable.control('', [Validators.required]),
    taxAmount: this.formBuilder.nonNullable.control(0, [Validators.required, Validators.min(0)]),
    discountAmount: this.formBuilder.nonNullable.control(0, [Validators.required, Validators.min(0)]),
    orderDate: this.formBuilder.nonNullable.control(''),
    expectedDeliveryDate: this.formBuilder.nonNullable.control(''),
    items: this.formBuilder.array<FormGroup>([])
  });

  constructor() {
    this.addLine();
    if (this.mode() === 'edit' && this.purchaseOrderId()) {
      this.loadPurchaseOrder(this.purchaseOrderId() as string);
    }
  }

  get items(): FormArray<FormGroup> {
    return this.form.controls.items;
  }

  goBack(): void {
    if (this.mode() === 'edit' && this.purchaseOrderId()) {
      void this.router.navigate(['/dashboard', 'procurement', this.purchaseOrderId()]);
      return;
    }
    void this.router.navigate(['/dashboard', 'procurement']);
  }

  addLine(): void {
    this.items.push(this.createLineGroup());
  }

  removeLine(index: number): void {
    if (this.items.length <= 1) {
      return;
    }
    this.items.removeAt(index);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (this.saving()) {
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
            void this.router.navigate(['/dashboard', 'procurement', res.result.id]);
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
          void this.router.navigate(['/dashboard', 'procurement', id]);
        },
        error: (err: unknown) => {
          this.messageService.add({ ...presentApiError(err).toast });
        }
      });
  }

  private createLineGroup(): FormGroup {
    return this.formBuilder.group({
      productId: this.formBuilder.nonNullable.control('', [Validators.required]),
      quantity: this.formBuilder.nonNullable.control(1, [Validators.required, Validators.min(1)]),
      unitPrice: this.formBuilder.nonNullable.control(0, [Validators.required, Validators.min(0)]),
      supplierProductCode: this.formBuilder.nonNullable.control('')
    });
  }

  private buildRequestBody(): CreatePurchaseOrderRequest {
    const raw = this.form.getRawValue();
    const orderDate = this.normalizeOptionalDate(raw.orderDate);
    const expectedDeliveryDate = this.normalizeOptionalDate(raw.expectedDeliveryDate);
    const PurchaseOrderItems = raw.items.map((line) => {
      const code = (line['supplierProductCode'] as string)?.trim();
      return {
        ProductId: (line['productId'] as string).trim(),
        Quantity: line['quantity'] as number,
        UnitPrice: line['unitPrice'] as number,
        SupplierProductCode: code ? code : null
      };
    });
    return {
      SupplierId: raw.supplierId.trim(),
      TaxAmount: raw.taxAmount,
      DiscountAmount: raw.discountAmount,
      OrderDate: orderDate,
      ExpectedDeliveryDate: expectedDeliveryDate,
      PurchaseOrderItems
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
            void this.router.navigate(['/dashboard', 'procurement']);
            return;
          }
          const po = res.result;
          if (!canEditPurchaseOrder(po.state)) {
            this.messageService.add({
              severity: 'warn',
              summary: 'Cannot edit',
              detail: 'Purchase orders can only be edited in Draft or Reopened state.'
            });
            void this.router.navigate(['/dashboard', 'procurement', id]);
            return;
          }
          this.patchFormFromPurchaseOrder(po);
        },
        error: (err: unknown) => {
          this.messageService.add({ ...presentApiError(err).toast });
          void this.router.navigate(['/dashboard', 'procurement']);
        }
      });
  }

  private patchFormFromPurchaseOrder(po: PurchaseOrder): void {
    this.items.clear();
    const lines = po.purchaseOrderItems?.length ? po.purchaseOrderItems : [];
    if (!lines.length) {
      this.addLine();
    } else {
      for (const line of lines) {
        const g = this.createLineGroup();
        g.patchValue({
          productId: line.productId,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          supplierProductCode: line.supplierProductCode ?? ''
        });
        this.items.push(g);
      }
    }

    this.supplierDisplayRef.set(
      po.supplier && po.supplier.id === po.supplierId ? po.supplier : null
    );

    this.form.patchValue({
      supplierId: po.supplierId,
      taxAmount: po.taxAmount,
      discountAmount: po.discountAmount,
      orderDate: this.toDateInputValue(po.orderDate),
      expectedDeliveryDate: this.toDateInputValue(po.expectedDeliveryDate)
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

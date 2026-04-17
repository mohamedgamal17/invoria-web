import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, map, take } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';

import { formatApiError } from '../../../../core/http/api-error.format';
import type { PurchaseOrder } from '../../models/purchase-order.entity';
import { purchaseStateLabel, purchaseStateSeverity } from '../../models/purchase-state.display';
import { PurchaseOrdersApiService } from '../../services/purchase-orders-api.service';

@Component({
  selector: 'app-purchase-order-details-page',
  standalone: true,
  imports: [CommonModule, ButtonModule, CardModule, SkeletonModule, ToastModule, TagModule, TableModule],
  providers: [MessageService],
  templateUrl: './purchase-order-details-page.component.html'
})
export class PurchaseOrderDetailsPageComponent {
  private readonly api = inject(PurchaseOrdersApiService);
  private readonly messageService = inject(MessageService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly purchaseOrderId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id') ?? '')),
    { initialValue: this.route.snapshot.paramMap.get('id') ?? '' }
  );

  readonly loading = signal(true);
  readonly error = signal('');
  readonly purchaseOrder = signal<PurchaseOrder | null>(null);

  readonly stateLabel = purchaseStateLabel;
  readonly stateSeverity = purchaseStateSeverity;

  constructor() {
    this.loadPurchaseOrder();
  }

  backToList(): void {
    void this.router.navigate(['/dashboard', 'procurement']);
  }

  retry(): void {
    this.loadPurchaseOrder();
  }

  supplierLine(po: PurchaseOrder): string {
    const name = po.supplier?.name?.trim();
    if (name) {
      return `${name} (${po.supplierId})`;
    }
    return po.supplierId;
  }

  private loadPurchaseOrder(idParam?: string): void {
    const id = idParam ?? this.purchaseOrderId();
    if (!id) {
      this.loading.set(false);
      this.error.set('Missing purchase order id.');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    this.api
      .getPurchaseOrder(id)
      .pipe(
        take(1),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: (res) => {
          if (!res.isSuccess || !res.result) {
            const detail = formatApiError(res.error);
            this.error.set(detail);
            this.messageService.add({ severity: 'error', summary: 'Error', detail });
            return;
          }
          this.purchaseOrder.set(res.result);
        },
        error: (err: unknown) => {
          const detail = formatApiError(err);
          this.error.set(detail);
          this.messageService.add({ severity: 'error', summary: 'Error', detail });
        }
      });
  }
}

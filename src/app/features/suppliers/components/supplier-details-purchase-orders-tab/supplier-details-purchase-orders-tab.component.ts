import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, linkedSignal, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';

import { MessageService } from 'primeng/api';

import { presentApiError } from '../../../../core/http/api-error.presenter';
import type { PagingInfo } from '../../../../core/models/paging';
import { PurchaseOrderListComponent } from '../../../procurement/components/purchase-order-list/purchase-order-list.component';
import type { ListPurchaseOrderRequest } from '../../../procurement/models/list-purchase-order.request';
import type { PurchaseOrder } from '../../../procurement/models/purchase-order.entity';
import { PurchaseOrdersApiService } from '../../../procurement/services/purchase-orders-api.service';

const EMPTY_PURCHASE_ORDERS_TUPLE: [PurchaseOrder[], PagingInfo] = [
  [],
  { length: 0, skip: 0, totalCount: 0 }
];

@Component({
  selector: 'app-supplier-details-purchase-orders-tab',
  standalone: true,
  imports: [CommonModule, PurchaseOrderListComponent],
  templateUrl: './supplier-details-purchase-orders-tab.component.html'
})
export class SupplierDetailsPurchaseOrdersTabComponent {
  readonly pageSizeOptions = [25, 50, 100, 200];

  private readonly purchaseOrdersApi = inject(PurchaseOrdersApiService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);

  readonly supplierId = input.required<string>();

  readonly pageIndex = signal(0);
  readonly pageSize = signal(25);
  readonly q = signal('');

  readonly first = computed(() => this.pageIndex() * this.pageSize());

  readonly listRequest = computed(
    (): ListPurchaseOrderRequest => ({
      Skip: this.pageIndex() * this.pageSize(),
      Length: this.pageSize(),
      Number: this.q() || null,
      SupplierId: this.supplierId(),
      IncludePurchaseItems: false,
      IncludeSupplier: true
    })
  );

  readonly purchaseOrdersResource = rxResource<[PurchaseOrder[], PagingInfo], ListPurchaseOrderRequest>({
    params: () => this.listRequest(),
    defaultValue: EMPTY_PURCHASE_ORDERS_TUPLE,
    stream: ({ params }) =>
      this.purchaseOrdersApi.listPurchaseOrders(params).pipe(
        map((res) => {
          if (!res.isSuccess || !res.result) {
            this.showApiError(res.error);
            return EMPTY_PURCHASE_ORDERS_TUPLE;
          }
          return [res.result.data, res.result.info] as [PurchaseOrder[], PagingInfo];
        }),
        catchError((err: unknown) => {
          this.showApiError(err);
          return of(EMPTY_PURCHASE_ORDERS_TUPLE);
        })
      )
  });

  readonly displayPurchaseOrders = linkedSignal({
    source: () => this.purchaseOrdersLinkSource(),
    computation: (src) => [...src.rows]
  });

  readonly displayPaging = linkedSignal({
    source: () => this.purchaseOrdersLinkSource(),
    computation: (src) => ({ ...src.paging })
  });

  goToDetails(po: PurchaseOrder): void {
    void this.router.navigate(['/procurement', po.id]);
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

  onPurchaseNumberFilterChange(value: string): void {
    const normalized = value.trim();
    if (normalized === this.q()) {
      return;
    }
    this.q.set(normalized);
    this.pageIndex.set(0);
  }

  private purchaseOrdersLinkSource(): {
    request: ListPurchaseOrderRequest;
    rows: PurchaseOrder[];
    paging: PagingInfo;
  } {
    const [rows, paging] = this.purchaseOrdersResource.value();
    return {
      request: this.listRequest(),
      rows,
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

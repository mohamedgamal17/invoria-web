import { CommonModule } from '@angular/common';
import { Component, computed, inject, linkedSignal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';

import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import type { PaginatorState } from 'primeng/paginator';
import type { TablePageEvent } from 'primeng/table';

import type { PagingInfo } from '../../../../core/models/paging';
import type { ListPurchaseOrderRequest } from '../../models/list-purchase-order.request';
import type { PurchaseOrder } from '../../models/purchase-order.entity';
import { PurchaseOrdersApiService } from '../../services/purchase-orders-api.service';
import { PurchaseOrderHeaderComponent } from '../../components/purchase-order-header/purchase-order-header.component';
import { PurchaseOrderListComponent } from '../../components/purchase-order-list/purchase-order-list.component';
import { formatApiError } from '../../../../core/http/api-error.format';

const EMPTY_PURCHASE_ORDERS_TUPLE: [PurchaseOrder[], PagingInfo] = [
  [],
  { length: 0, skip: 0, totalCount: 0 }
];

@Component({
  selector: 'app-purchase-list-page',
  standalone: true,
  imports: [
    CommonModule,
    ToastModule,
    PurchaseOrderHeaderComponent,
    PurchaseOrderListComponent
  ],
  providers: [MessageService],
  templateUrl: './purchase-list-page.component.html'
})
export class PurchaseListPageComponent {
  readonly pageSizeOptions = [25, 50, 100, 200];

  private readonly purchaseOrdersApi = inject(PurchaseOrdersApiService);
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

  readonly pageIndex = computed(() => Math.max(0, this.pageFromRoute() - 1));

  readonly first = computed(() => this.pageIndex() * this.pageSize());

  readonly listRequest = computed(
    (): ListPurchaseOrderRequest => ({
      Skip: this.pageIndex() * this.pageSize(),
      Length: this.pageSize(),
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
            const detail = formatApiError(res.error);
            this.messageService.add({ severity: 'error', summary: 'Error', detail });
            return EMPTY_PURCHASE_ORDERS_TUPLE;
          }
          return [res.result.data, res.result.info] as [PurchaseOrder[], PagingInfo];
        }),
        catchError((err: unknown) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: formatApiError(err) });
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
    void this.router.navigate([po.id], { relativeTo: this.route });
  }

  goToCreate(): void {
    void this.router.navigate(['new'], { relativeTo: this.route });
  }

  onPageChange(event: PaginatorState | TablePageEvent): void {
    const firstEvt = event.first ?? 0;
    const rows = event.rows ?? this.pageSize();
    const newPageIndex = Math.floor(firstEvt / Math.max(rows, 1));

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
}

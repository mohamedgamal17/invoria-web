import { CommonModule } from '@angular/common';
import { Component, computed, inject, linkedSignal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';

import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import type { PaginatorState } from 'primeng/paginator';
import type { TablePageEvent } from 'primeng/table';

import { InvoicesApiService } from '../../services/invoices-api.service';
import type { ListInvoiceRequest } from '../../models/list-invoice.request';
import { InvoiceListComponent } from '../../components/invoice-list/invoice-list.component';
import { InvoiceHeaderComponent } from '../../components/invoice-header/invoice-header.component';
import {
  InvoicesFilterPanelComponent,
  type InvoicesListFilters
} from '../../components/invoices-filter-panel/invoices-filter-panel.component';
import type { Invoice } from '../../models/invoice.entity';
import type { PagingInfo } from '../../../../core/models/paging';
import { presentApiError } from '../../../../core/http/api-error.presenter';

const EMPTY_INVOICES_TUPLE: [Invoice[], PagingInfo] = [
  [],
  { length: 0, skip: 0, totalCount: 0 }
];

@Component({
  selector: 'app-invoices-page',
  standalone: true,
  imports: [
    CommonModule,
    ToastModule,
    InvoiceHeaderComponent,
    InvoicesFilterPanelComponent,
    InvoiceListComponent
  ],
  providers: [MessageService],
  templateUrl: './invoices-page.component.html'
})
export class InvoicesPageComponent {
  readonly pageSizeOptions = [25, 50, 100, 200];

  private readonly invoicesApi = inject(InvoicesApiService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

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

  readonly customerIdFromRoute = toSignal(
    this.route.queryParamMap.pipe(
      map((m) => {
        const q = m.get('customerId')?.trim();
        return q ? q : '';
      })
    ),
    { initialValue: '' }
  );

  readonly orderIdFromRoute = toSignal(
    this.route.queryParamMap.pipe(
      map((m) => {
        const q = m.get('orderId')?.trim();
        return q ? q : '';
      })
    ),
    { initialValue: '' }
  );

  readonly pageIndex = computed(() => Math.max(0, this.pageFromRoute() - 1));

  readonly listRequest = computed((): ListInvoiceRequest => ({
    Skip: this.pageIndex() * this.pageSize(),
    Length: this.pageSize(),
    CustomerId: this.customerIdFromRoute() || null,
    OrderId: this.orderIdFromRoute() || null
  }));

  readonly first = computed(() => this.pageIndex() * this.pageSize());

  readonly invoicesResource = rxResource<[Invoice[], PagingInfo], ListInvoiceRequest>({
    params: () => this.listRequest(),
    defaultValue: EMPTY_INVOICES_TUPLE,
    stream: ({ params }) =>
      this.invoicesApi.listInvoices(params).pipe(
        map((res) => {
          if (!res.isSuccess || !res.result) {
            this.showApiError(res.error);
            return EMPTY_INVOICES_TUPLE;
          }
          return [res.result.data, res.result.info] as [Invoice[], PagingInfo];
        }),
        catchError((err: unknown) => {
          this.showApiError(err);
          return of(EMPTY_INVOICES_TUPLE);
        })
      )
  });

  readonly displayInvoices = linkedSignal({
    source: () => this.invoicesLinkSource(),
    computation: (src) => [...src.invoices]
  });

  readonly displayPaging = linkedSignal({
    source: () => this.invoicesLinkSource(),
    computation: (src) => ({ ...src.paging })
  });

  goToDetails(invoice: Invoice): void {
    void this.router.navigate([invoice.id], { relativeTo: this.route });
  }

  onPageChange(event: PaginatorState | TablePageEvent): void {
    const firstEvt = event.first ?? 0;
    const rows = event.rows ?? this.pageSize();
    const newPageIndex = Math.floor(firstEvt / Math.max(rows, 1));

    if (this.pageIndex() !== newPageIndex || this.pageSize() !== rows) {
      const isManualPageChange = this.pageIndex() !== newPageIndex;

      void this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { page: newPageIndex + 1, pageSize: rows },
        queryParamsHandling: 'merge'
      });

      if (isManualPageChange) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }

  onFiltersChange(filters: InvoicesListFilters): void {
    const normalizedCustomerId = filters.customerId.trim();
    const normalizedOrderId = filters.orderId.trim();

    if (normalizedCustomerId === this.customerIdFromRoute() && normalizedOrderId === this.orderIdFromRoute()) {
      return;
    }

    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        customerId: normalizedCustomerId || null,
        orderId: normalizedOrderId || null,
        page: 1
      },
      queryParamsHandling: 'merge'
    });
  }

  onClearFilters(): void {
    if (!this.customerIdFromRoute() && !this.orderIdFromRoute()) {
      return;
    }

    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { customerId: null, orderId: null, page: 1 },
      queryParamsHandling: 'merge'
    });
  }

  private invoicesLinkSource(): {
    request: ListInvoiceRequest;
    invoices: Invoice[];
    paging: PagingInfo;
  } {
    const [invoices, paging] = this.invoicesResource.value();
    return {
      request: this.listRequest(),
      invoices,
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

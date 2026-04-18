import { CommonModule } from '@angular/common';
import { Component, computed, inject, linkedSignal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { SuppliersApiService } from '../../services/suppliers-api.service';
import type { ListSupplierRequest } from '../../models/list-supplier.request';
import { SupplierListComponent } from '../../components/supplier-list/supplier-list.component';
import type { Supplier } from '../../models/supplier.entity';
import type { PagingInfo } from '../../../../core/models/paging';
import { formatApiError } from '../../../../core/http/api-error.format';

const EMPTY_SUPPLIERS_TUPLE: [Supplier[], PagingInfo] = [
  [],
  { length: 0, skip: 0, totalCount: 0 }
];

@Component({
  selector: 'app-suppliers-page',
  standalone: true,
  imports: [CommonModule, ButtonModule, ToastModule, SupplierListComponent],
  providers: [MessageService],
  templateUrl: './suppliers-page.component.html'
})
export class SuppliersPageComponent {
  readonly pageSizeOptions = [5, 10, 20];

  private readonly suppliersApi = inject(SuppliersApiService);
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
        return this.pageSizeOptions.includes(n) ? n : 10;
      })
    ),
    { initialValue: 10 }
  );

  readonly pageIndex = computed(() => Math.max(0, this.pageFromRoute() - 1));

  readonly listRequest = computed((): ListSupplierRequest => ({
    Skip: this.pageIndex() * this.pageSize(),
    Length: this.pageSize()
  }));

  readonly first = computed(() => this.pageIndex() * this.pageSize());

  readonly suppliersResource = rxResource<[Supplier[], PagingInfo], ListSupplierRequest>({
    params: () => this.listRequest(),
    defaultValue: EMPTY_SUPPLIERS_TUPLE,
    stream: ({ params }) =>
      this.suppliersApi.listSuppliers(params).pipe(
        map((res) => {
          if (!res.isSuccess || !res.result) {
            const detail = formatApiError(res.error);
            this.messageService.add({ severity: 'error', summary: 'Error', detail });
            return EMPTY_SUPPLIERS_TUPLE;
          }
          return [res.result.data, res.result.info] as [Supplier[], PagingInfo];
        }),
        catchError((err: unknown) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: formatApiError(err)
          });
          return of(EMPTY_SUPPLIERS_TUPLE);
        })
      )
  });

  readonly displaySuppliers = linkedSignal({
    source: () => this.suppliersLinkSource(),
    computation: (src) => [...src.suppliers]
  });

  readonly displayPaging = linkedSignal({
    source: () => this.suppliersLinkSource(),
    computation: (src) => ({ ...src.paging })
  });

  navigateToCreate(): void {
    void this.router.navigate(['new'], { relativeTo: this.route.parent });
  }

  goToDetails(supplier: Supplier): void {
    void this.router.navigate([supplier.id], { relativeTo: this.route });
  }

  onPageChange(event: unknown): void {
    const evt = event as { rows?: number; page?: number; first?: number };
    const rows = evt.rows ?? this.pageSize();
    const firstEvt = evt.first ?? 0;
    const newPageIndex = evt.page ?? Math.floor(firstEvt / Math.max(rows, 1));

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

  private suppliersLinkSource(): {
    request: ListSupplierRequest;
    suppliers: Supplier[];
    paging: PagingInfo;
  } {
    const [suppliers, paging] = this.suppliersResource.value();
    return {
      request: this.listRequest(),
      suppliers,
      paging
    };
  }
}

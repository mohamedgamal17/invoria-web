import { CommonModule } from '@angular/common';
import { Component, computed, inject, linkedSignal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';

import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import type { PaginatorState } from 'primeng/paginator';
import type { TablePageEvent } from 'primeng/table';

import { SuppliersApiService } from '../../services/suppliers-api.service';
import type { ListSupplierRequest } from '../../models/list-supplier.request';
import { SupplierListComponent } from '../../components/supplier-list/supplier-list.component';
import { SupplierHeaderComponent } from '../../components/supplier-header/supplier-header.component';
import {
  SuppliersFilterPanelComponent,
  type SuppliersListFilters
} from '../../components/suppliers-filter-panel/suppliers-filter-panel.component';
import type { Supplier } from '../../models/supplier.entity';
import type { PagingInfo } from '../../../../core/models/paging';
import { presentApiError } from '../../../../core/http/api-error.presenter';

const EMPTY_SUPPLIERS_TUPLE: [Supplier[], PagingInfo] = [
  [],
  { length: 0, skip: 0, totalCount: 0 }
];

@Component({
  selector: 'app-suppliers-page',
  standalone: true,
  imports: [
    CommonModule,
    ToastModule,
    SupplierHeaderComponent,
    SuppliersFilterPanelComponent,
    SupplierListComponent
  ],
  providers: [MessageService],
  templateUrl: './suppliers-page.component.html'
})
export class SuppliersPageComponent {
  readonly pageSizeOptions = [25, 50, 100, 200];

  private readonly suppliersApi = inject(SuppliersApiService);
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

  /** Name filter from `?q=` (trimmed; default empty). */
  readonly qFromRoute = toSignal(
    this.route.queryParamMap.pipe(
      map((m) => {
        const q = m.get('q')?.trim();
        return q ? q : '';
      })
    ),
    { initialValue: '' }
  );

  /** 0-based page index derived from the URL. */
  readonly pageIndex = computed(() => Math.max(0, this.pageFromRoute() - 1));

  readonly listRequest = computed((): ListSupplierRequest => ({
    Skip: this.pageIndex() * this.pageSize(),
    Length: this.pageSize(),
    Name: this.qFromRoute() || null
  }));

  readonly first = computed(() => this.pageIndex() * this.pageSize());

  readonly suppliersResource = rxResource<[Supplier[], PagingInfo], ListSupplierRequest>({
    params: () => this.listRequest(),
    defaultValue: EMPTY_SUPPLIERS_TUPLE,
    stream: ({ params }) =>
      this.suppliersApi.listSuppliers(params).pipe(
        map((res) => {
          if (!res.isSuccess || !res.result) {
            this.showApiError(res.error);
            return EMPTY_SUPPLIERS_TUPLE;
          }
          return [res.result.data, res.result.info] as [Supplier[], PagingInfo];
        }),
        catchError((err: unknown) => {
          this.showApiError(err);
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

  goToCreate(): void {
    void this.router.navigate(['new'], { relativeTo: this.route });
  }

  goToDetails(supplier: Supplier): void {
    void this.router.navigate([supplier.id], { relativeTo: this.route });
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

  onFiltersChange(filters: SuppliersListFilters): void {
    const normalized = filters.name.trim();
    if (normalized === this.qFromRoute()) {
      return;
    }

    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { q: normalized || null, page: 1 },
      queryParamsHandling: 'merge'
    });
  }

  onClearFilters(): void {
    if (!this.qFromRoute()) {
      return;
    }

    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { q: null, page: 1 },
      queryParamsHandling: 'merge'
    });
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

  private showApiError(error: unknown): void {
    const presentation = presentApiError(error);
    this.messageService.add(presentation.toast);
    if (presentation.routeTarget) {
      void this.router.navigate([presentation.routeTarget]);
    }
  }
}

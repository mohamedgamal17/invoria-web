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
import { presentApiError } from '../../../../core/http/api-error.presenter';
import { parseOptionalEnumQueryParam } from '../../../../shared/navigation/query-param-parsers';
import { ReturnsApiService } from '../../services/returns-api.service';
import type { Return } from '../../models/return.entity';
import type { ListReturnRequest } from '../../models/list-return.request';
import { ReturnType } from '../../models/return-type.enum';
import { ReturnHeaderComponent } from '../../components/return-header/return-header.component';
import {
  ReturnsFilterPanelComponent,
  type ReturnsListFilters
} from '../../components/returns-filter-panel/returns-filter-panel.component';
import { ReturnListComponent } from '../../components/return-list/return-list.component';

const RETURN_TYPE_VALUES = Object.values(ReturnType).filter(
  (v): v is number => typeof v === 'number'
);

const EMPTY_RETURNS_TUPLE: [Return[], PagingInfo] = [
  [],
  { length: 0, skip: 0, totalCount: 0 }
];

@Component({
  selector: 'app-returns-page',
  standalone: true,
  imports: [
    CommonModule,
    ToastModule,
    ReturnHeaderComponent,
    ReturnsFilterPanelComponent,
    ReturnListComponent
  ],
  providers: [MessageService],
  templateUrl: './returns-page.component.html'
})
export class ReturnsPageComponent {
  readonly pageSizeOptions = [25, 50, 100, 200];

  private readonly returnsApi = inject(ReturnsApiService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  /** 1-based page number from ?page= (default 1). */
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

  /** Page size from ?pageSize= (must be in pageSizeOptions; default 25). */
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

  /** Return type filter from ?type= (optional enum). */
  readonly typeFilterFromRoute = toSignal(
    this.route.queryParamMap.pipe(
      map((m) => parseOptionalEnumQueryParam(m, 'type', RETURN_TYPE_VALUES))
    ),
    { initialValue: null as number | null }
  );

  /** 0-based page index derived from the URL. */
  readonly pageIndex = computed(() => Math.max(0, this.pageFromRoute() - 1));

  readonly listRequest = computed((): ListReturnRequest => {
    const req: ListReturnRequest = {
      Skip: this.pageIndex() * this.pageSize(),
      Length: this.pageSize()
    };
    const type = this.typeFilterFromRoute();
    if (type != null) {
      req.Type = type;
    }
    return req;
  });

  readonly first = computed(() => this.pageIndex() * this.pageSize());

  readonly returnsResource = rxResource<[Return[], PagingInfo], ListReturnRequest>({
    params: () => this.listRequest(),
    defaultValue: EMPTY_RETURNS_TUPLE,
    stream: ({ params }) =>
      this.returnsApi.listReturns(params).pipe(
        map((res) => {
          if (!res.isSuccess || !res.result) {
            this.showApiError(res.error);
            return EMPTY_RETURNS_TUPLE;
          }
          return [res.result.data, res.result.info] as [Return[], PagingInfo];
        }),
        catchError((err: unknown) => {
          this.showApiError(err);
          return of(EMPTY_RETURNS_TUPLE);
        })
      )
  });

  readonly displayReturns = linkedSignal({
    source: () => this.returnsLinkSource(),
    computation: (src) => [...src.returns]
  });

  readonly displayPaging = linkedSignal({
    source: () => this.returnsLinkSource(),
    computation: (src) => ({ ...src.paging })
  });

  goToDetails(ret: Return): void {
    void this.router.navigate([ret.id], { relativeTo: this.route });
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

  onFiltersChange(filters: ReturnsListFilters): void {
    if (filters.type === this.typeFilterFromRoute()) {
      return;
    }

    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        type: filters.type != null ? String(filters.type) : null,
        page: 1
      },
      queryParamsHandling: 'merge'
    });
  }

  onClearFilters(): void {
    if (this.typeFilterFromRoute() == null) {
      return;
    }

    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        type: null,
        page: 1
      },
      queryParamsHandling: 'merge'
    });
  }

  private returnsLinkSource(): {
    request: ListReturnRequest;
    returns: Return[];
    paging: PagingInfo;
  } {
    const [returns, paging] = this.returnsResource.value();
    return {
      request: this.listRequest(),
      returns,
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

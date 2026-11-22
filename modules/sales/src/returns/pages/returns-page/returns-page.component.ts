import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, linkedSignal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';

import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

import type { PagingInfo } from '@invoria/core';
import { presentApiError } from '@invoria/core';
import { parseOptionalEnumQueryParam } from '@invoria/utils';
import { PaginationService } from '@invoria/utils';
import {
  DEFAULT_PAGE_SIZE_OPTIONS,
  type PaginatorPageEvent,
} from '@invoria/utils';
import { ReturnsApiService } from '@invoria/sales/returns/services/returns-api.service';
import type { Return } from '@invoria/sales/returns/models/return.entity';
import type { ListReturnRequest } from '@invoria/sales/returns/models/list-return.request';
import { ReturnType } from '@invoria/sales/returns/models/return-type.enum';
import { ReturnHeaderComponent } from '@invoria/sales/returns/components/return-header/return-header.component';
import { ReturnsFilterPanelComponent } from '@invoria/sales/returns/components/returns-filter-panel/returns-filter-panel.component';
import type { ReturnsListFilters } from '@invoria/sales/returns/models/returns-list.filters';
import { ReturnListComponent } from '@invoria/sales/returns/components/return-list/return-list.component';

const RETURN_TYPE_VALUES = Object.values(ReturnType).filter(
  (value): value is number => typeof value === 'number',
);

const EMPTY_RETURNS_TUPLE: [Return[], PagingInfo] = [[], { length: 0, skip: 0, totalCount: 0 }];

@Component({
  selector: 'app-returns-page',
  standalone: true,
  imports: [
    CommonModule,
    ToastModule,
    ReturnHeaderComponent,
    ReturnsFilterPanelComponent,
    ReturnListComponent,
  ],
  providers: [MessageService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './returns-page.component.html',
})
export class ReturnsPageComponent {
  readonly pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS;

  private readonly pagination = inject(PaginationService);
  private readonly returnsApi = inject(ReturnsApiService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  /** 1-based page number from ?page= (default 1). */
  private readonly pageFromRoute = toSignal(
    this.route.queryParamMap.pipe(
      map((paramMap) => {
        const raw = paramMap.get('page');
        const pageNumber = raw ? parseInt(raw, 10) : 1;
        return Number.isFinite(pageNumber) && pageNumber >= 1 ? pageNumber : 1;
      }),
    ),
    { initialValue: 1 },
  );

  /** Page size from ?pageSize= (must be in pageSizeOptions; default 25). */
  readonly pageSize = toSignal(
    this.route.queryParamMap.pipe(
      map((paramMap) => this.pagination.pageSizeFromQuery(Number(paramMap.get('pageSize')))),
    ),
    { initialValue: 25 },
  );

  /** Return type filter from ?type= (optional enum). */
  readonly typeFilterFromRoute = toSignal(
    this.route.queryParamMap.pipe(
      map((paramMap) => parseOptionalEnumQueryParam(paramMap, 'type', RETURN_TYPE_VALUES)),
    ),
    { initialValue: null as number | null },
  );

  /** 0-based page index derived from the URL. */
  readonly pageIndex = computed(() => Math.max(0, this.pageFromRoute() - 1));

  readonly listRequest = computed((): ListReturnRequest => {
    const req: ListReturnRequest = {
      skip: this.pageIndex() * this.pageSize(),
      length: this.pageSize(),
    };
    const type = this.typeFilterFromRoute();
    if (type != null) {
      req.type = type;
    }
    return req;
  });

  readonly first = computed(() => this.pageIndex() * this.pageSize());

  readonly returnsResource = rxResource<[Return[], PagingInfo], ListReturnRequest>({
    params: () => this.listRequest(),
    defaultValue: EMPTY_RETURNS_TUPLE,
    stream: ({ params }) =>
      this.returnsApi.listReturns(params).pipe(
        map((response) => {
          if (!response.isSuccess || !response.result) {
            this.showApiError(response.error);
            return EMPTY_RETURNS_TUPLE;
          }
          return [response.result.data, response.result.info] as [Return[], PagingInfo];
        }),
        catchError((error: unknown) => {
          this.showApiError(error);
          return of(EMPTY_RETURNS_TUPLE);
        }),
      ),
  });

  readonly displayReturns = linkedSignal({
    source: () => this.returnsLinkSource(),
    computation: (source) => [...source.returns],
  });

  readonly displayPaging = linkedSignal({
    source: () => this.returnsLinkSource(),
    computation: (source) => ({ ...source.paging }),
  });

  goToDetails(returnItem: Return): void {
    void this.router.navigate([returnItem.id], { relativeTo: this.route });
  }

  onPageChange(event: PaginatorPageEvent): void {
    const firstEvt = event.first ?? 0;
    const rows = event.rows ?? this.pageSize();
    const newPageIndex = Math.floor(firstEvt / Math.max(rows, 1));

    if (this.pageIndex() !== newPageIndex || this.pageSize() !== rows) {
      const isManualPageChange = this.pageIndex() !== newPageIndex;

      void this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {
          page: newPageIndex + 1,
          pageSize: rows,
        },
        queryParamsHandling: 'merge',
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
        page: 1,
      },
      queryParamsHandling: 'merge',
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
        page: 1,
      },
      queryParamsHandling: 'merge',
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
      paging,
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

import { CommonModule } from '@angular/common';
import { Component, computed, inject, linkedSignal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';

import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import type { PaginatorState } from 'primeng/paginator';
import type { TablePageEvent } from 'primeng/table';

import { ReceivablesApiService } from '../../services/receivables-api.service';
import type { ListReceivableRequest } from '../../models/list-receivable.request';
import { ReceivableListComponent } from '../../components/receivable-list/receivable-list.component';
import { ReceivableHeaderComponent } from '../../components/receivable-header/receivable-header.component';
import {
  ReceivablesFilterPanelComponent,
  type ReceivablesListFilters
} from '../../components/receivables-filter-panel/receivables-filter-panel.component';
import type { Receivable } from '../../models/receivable.entity';
import type { PagingInfo } from '../../../../core/models/paging';
import { presentApiError } from '../../../../core/http/api-error.presenter';

const EMPTY_RECEIVABLES_TUPLE: [Receivable[], PagingInfo] = [
  [],
  { length: 0, skip: 0, totalCount: 0 }
];

function parseIsPaid(raw: string | null): boolean | null {
  if (raw === 'true') return true;
  if (raw === 'false') return false;
  return null;
}

@Component({
  selector: 'app-receivables-page',
  standalone: true,
  imports: [
    CommonModule,
    ToastModule,
    ReceivableHeaderComponent,
    ReceivablesFilterPanelComponent,
    ReceivableListComponent
  ],
  providers: [MessageService],
  templateUrl: './receivables-page.component.html'
})
export class ReceivablesPageComponent {
  readonly pageSizeOptions = [25, 50, 100, 200];

  private readonly receivablesApi = inject(ReceivablesApiService);
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

  readonly partyIdFromRoute = toSignal(
    this.route.queryParamMap.pipe(
      map((m) => {
        const q = m.get('partyId')?.trim();
        return q ? q : '';
      })
    ),
    { initialValue: '' }
  );

  readonly sourceIdFromRoute = toSignal(
    this.route.queryParamMap.pipe(
      map((m) => {
        const q = m.get('sourceId')?.trim();
        return q ? q : '';
      })
    ),
    { initialValue: '' }
  );

  readonly isPaidFromRoute = toSignal(
    this.route.queryParamMap.pipe(map((m) => parseIsPaid(m.get('isPaid')))),
    { initialValue: null }
  );

  readonly pageIndex = computed(() => Math.max(0, this.pageFromRoute() - 1));

  readonly listRequest = computed((): ListReceivableRequest => ({
    Skip: this.pageIndex() * this.pageSize(),
    Length: this.pageSize(),
    PartyId: this.partyIdFromRoute() || null,
    SourceId: this.sourceIdFromRoute() || null,
    IsPaid: this.isPaidFromRoute()
  }));

  readonly first = computed(() => this.pageIndex() * this.pageSize());

  readonly receivablesResource = rxResource<[Receivable[], PagingInfo], ListReceivableRequest>({
    params: () => this.listRequest(),
    defaultValue: EMPTY_RECEIVABLES_TUPLE,
    stream: ({ params }) =>
      this.receivablesApi.listReceivables(params).pipe(
        map((res) => {
          if (!res.isSuccess || !res.result) {
            this.showApiError(res.error);
            return EMPTY_RECEIVABLES_TUPLE;
          }
          return [res.result.data, res.result.info] as [Receivable[], PagingInfo];
        }),
        catchError((err: unknown) => {
          this.showApiError(err);
          return of(EMPTY_RECEIVABLES_TUPLE);
        })
      )
  });

  readonly displayReceivables = linkedSignal({
    source: () => this.receivablesLinkSource(),
    computation: (src) => [...src.receivables]
  });

  readonly displayPaging = linkedSignal({
    source: () => this.receivablesLinkSource(),
    computation: (src) => ({ ...src.paging })
  });

  goToDetails(receivable: Receivable): void {
    void this.router.navigate([receivable.id], { relativeTo: this.route });
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

  onFiltersChange(filters: ReceivablesListFilters): void {
    const normalizedPartyId = filters.partyId.trim();
    const normalizedSourceId = filters.sourceId.trim();

    if (
      normalizedPartyId === this.partyIdFromRoute() &&
      normalizedSourceId === this.sourceIdFromRoute() &&
      filters.isPaid === this.isPaidFromRoute()
    ) {
      return;
    }

    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        partyId: normalizedPartyId || null,
        sourceId: normalizedSourceId || null,
        isPaid:
          filters.isPaid === null || filters.isPaid === undefined
            ? null
            : String(filters.isPaid),
        page: 1
      },
      queryParamsHandling: 'merge'
    });
  }

  onClearFilters(): void {
    if (!this.partyIdFromRoute() && !this.sourceIdFromRoute() && this.isPaidFromRoute() === null) {
      return;
    }

    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { partyId: null, sourceId: null, isPaid: null, page: 1 },
      queryParamsHandling: 'merge'
    });
  }

  private receivablesLinkSource(): {
    request: ListReceivableRequest;
    receivables: Receivable[];
    paging: PagingInfo;
  } {
    const [receivables, paging] = this.receivablesResource.value();
    return {
      request: this.listRequest(),
      receivables,
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

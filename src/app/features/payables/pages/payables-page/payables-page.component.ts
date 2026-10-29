import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, from, map, of } from 'rxjs';

import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import type { PaginatorState } from 'primeng/paginator';
import type { TablePageEvent } from 'primeng/table';

import { PayablesApiService } from '../../services/payables-api.service';
import { PayableReferenceResolverService } from '../../services/payable-reference-resolver.service';
import { SuppliersApiService } from '../../../suppliers/services/suppliers-api.service';
import type { ListPayableRequest } from '../../models/list-payable.request';
import type { Payable } from '../../models/payable.entity';
import { PayableListComponent } from '../../components/payable-list/payable-list.component';
import { PayableHeaderComponent } from '../../components/payable-header/payable-header.component';
import {
  PayablesFilterPanelComponent,
  type PayablesListFilters
} from '../../components/payables-filter-panel/payables-filter-panel.component';
import type { PagingInfo } from '../../../../core/models/paging';
import { presentApiError } from '../../../../core/http/api-error.presenter';

const EMPTY_PAYABLES_TUPLE: [Payable[], PagingInfo] = [
  [],
  { length: 0, skip: 0, totalCount: 0 }
];

/** Client-side reference maps for the current page (hydrated `party`/`source` views). */
const EMPTY_PAGE_REFS = {
  parties: {} as Record<string, string | null>,
  sources: {} as Record<string, string | null>
};

const SUPPLIER_OPTIONS_PAGE_SIZE = 200;

function parseIsPaid(raw: string | null): boolean | null {
  if (raw === 'true') return true;
  if (raw === 'false') return false;
  return null;
}

function hydratePayable(
  payable: Payable,
  refs: typeof EMPTY_PAGE_REFS
): Payable {
  const partyName = refs.parties[payable.partyId] ?? payable.party?.name ?? null;
  const purchaseNumber = refs.sources[payable.sourceId] ?? payable.source?.purchaseNumber ?? null;
  return {
    ...payable,
    party: partyName ? { id: payable.partyId, name: partyName } : (payable.party ?? null),
    source: purchaseNumber
      ? { id: payable.sourceId, purchaseNumber }
      : (payable.source ?? null)
  };
}

@Component({
  selector: 'app-payables-page',
  standalone: true,
  imports: [
    CommonModule,
    ToastModule,
    PayableHeaderComponent,
    PayablesFilterPanelComponent,
    PayableListComponent
  ],
  providers: [MessageService],
  templateUrl: './payables-page.component.html'
})
export class PayablesPageComponent {
  readonly pageSizeOptions = [25, 50, 100, 200];

  private readonly payablesApi = inject(PayablesApiService);
  private readonly referenceResolver = inject(PayableReferenceResolverService);
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
        return this.pageSizeOptions.includes(n) ? n : 25;
      })
    ),
    { initialValue: 25 }
  );

  readonly supplierIdFromRoute = toSignal(
    this.route.queryParamMap.pipe(
      map((m) => {
        const q = m.get('supplierId')?.trim() ?? m.get('partyId')?.trim();
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

  readonly listRequest = computed((): ListPayableRequest => ({
    Skip: this.pageIndex() * this.pageSize(),
    Length: this.pageSize(),
    PartyId: this.supplierIdFromRoute() || null,
    SourceId: this.sourceIdFromRoute() || null,
    IsPaid: this.isPaidFromRoute()
  }));

  readonly first = computed(() => this.pageIndex() * this.pageSize());

  /** Supplier options for the filter dropdown (loaded once). */
  readonly suppliersResource = rxResource<
    { id: string; name: string }[],
    void
  >({
    params: () => undefined,
    defaultValue: [],
    stream: () =>
      this.suppliersApi.searchSuppliers({ Skip: 0, Length: SUPPLIER_OPTIONS_PAGE_SIZE }).pipe(
        map((suppliers) => suppliers.map((s) => ({ id: s.id, name: s.name }))),
        catchError(() => of([]))
      )
  });

  readonly payablesResource = rxResource<[Payable[], PagingInfo], ListPayableRequest>({
    params: () => this.listRequest(),
    defaultValue: EMPTY_PAYABLES_TUPLE,
    stream: ({ params }) =>
      this.payablesApi.listPayables(params).pipe(
        map((res) => {
          if (!res.isSuccess || !res.result) {
            this.showApiError(res.error);
            return EMPTY_PAYABLES_TUPLE;
          }
          return [res.result.data, res.result.info] as [Payable[], PagingInfo];
        }),
        catchError((err: unknown) => {
          this.showApiError(err);
          return of(EMPTY_PAYABLES_TUPLE);
        })
      )
  });

  /** Distinct party/source ids on the current page, for client-side enrichment. */
  private readonly pageRefsRequest = computed(() => {
    const [payables] = this.payablesResource.value();
    return {
      partyIds: [...new Set(payables.map((p) => p.partyId))],
      sourceIds: [...new Set(payables.map((p) => p.sourceId))]
    };
  });

  private readonly pageRefsResource = rxResource<
    typeof EMPTY_PAGE_REFS,
    { partyIds: string[]; sourceIds: string[] }
  >({
    params: () => this.pageRefsRequest(),
    defaultValue: EMPTY_PAGE_REFS,
    stream: ({ params }) => {
      if (params.partyIds.length === 0 && params.sourceIds.length === 0) {
        return of(EMPTY_PAGE_REFS);
      }
      return from(
        Promise.all([
          Promise.all(params.partyIds.map((id) => this.referenceResolver.getPartyName(id))),
          Promise.all(params.sourceIds.map((id) => this.referenceResolver.getPurchaseOrderNumber(id)))
        ]).then(([partyNames, sourceNumbers]) => ({
          parties: Object.fromEntries(params.partyIds.map((id, i) => [id, partyNames[i]])),
          sources: Object.fromEntries(params.sourceIds.map((id, i) => [id, sourceNumbers[i]]))
        }))
      );
    }
  });

  readonly displayPayables = computed(() =>
    this.payablesResource
      .value()[0]
      .map((payable) => hydratePayable(payable, this.pageRefsResource.value()))
  );

  readonly displayPagingInfo = computed(() => this.payablesResource.value()[1]);

  goToDetails(payable: Payable): void {
    void this.router.navigate([payable.id], { relativeTo: this.route });
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

  onFiltersChange(filters: PayablesListFilters): void {
    const normalizedSupplierId = filters.supplierId.trim();
    const normalizedSourceId = filters.sourceId.trim();

    if (
      normalizedSupplierId === this.supplierIdFromRoute() &&
      normalizedSourceId === this.sourceIdFromRoute() &&
      filters.isPaid === this.isPaidFromRoute()
    ) {
      return;
    }

    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        supplierId: normalizedSupplierId || null,
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
    if (
      !this.supplierIdFromRoute() &&
      !this.sourceIdFromRoute() &&
      this.isPaidFromRoute() === null
    ) {
      return;
    }

    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { supplierId: null, sourceId: null, isPaid: null, page: 1 },
      queryParamsHandling: 'merge'
    });
  }

  private showApiError(error: unknown): void {
    const presentation = presentApiError(error);
    this.messageService.add(presentation.toast);
    if (presentation.routeTarget) {
      void this.router.navigate([presentation.routeTarget]);
    }
  }
}

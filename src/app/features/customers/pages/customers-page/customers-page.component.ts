import { CommonModule } from '@angular/common';
import { Component, computed, inject, linkedSignal, model, signal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, finalize, map, of, take } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { CustomersApiService } from '../../services/customers-api.service';
import type { CreateCustomerRequest } from '../../models/create-customer.request';
import type { ListCustomerRequest } from '../../models/list-customer.request';
import type { UpdateCustomerRequest } from '../../models/update-customer.request';
import { CustomerFormDialogComponent } from '../../components/customer-form-dialog/customer-form-dialog.component';
import { CustomerListComponent } from '../../components/customer-list/customer-list.component';
import type { Customer } from '../../models/customer.entity';
import type { PagingInfo } from '../../../../core/models/paging';

type CustomerDraft = {
  name: string;
};

type ModalMode = 'create' | 'edit';

const EMPTY_CUSTOMERS_TUPLE: [Customer[], PagingInfo] = [
  [],
  { length: 0, skip: 0, totalCount: 0 }
];

@Component({
  selector: 'app-customers-page',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    ToastModule,
    CustomerListComponent,
    CustomerFormDialogComponent
  ],
  providers: [MessageService],
  templateUrl: './customers-page.component.html'
})
export class CustomersPageComponent {
  readonly pageSizeOptions = [5, 10, 20];

  private readonly customersApi = inject(CustomersApiService);
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

  /** Page size from `?pageSize=` (must be in pageSizeOptions; default 10). */
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

  /** 0-based page index derived from the URL. */
  readonly pageIndex = computed(() => Math.max(0, this.pageFromRoute() - 1));

  readonly listRequest = computed((): ListCustomerRequest => ({
    Skip: this.pageIndex() * this.pageSize(),
    Length: this.pageSize()
  }));

  readonly customersResource = rxResource<[Customer[], PagingInfo], ListCustomerRequest>({
    params: () => this.listRequest(),
    defaultValue: EMPTY_CUSTOMERS_TUPLE,
    stream: ({ params }) =>
      this.customersApi.listCustomers(params).pipe(
        map((res) => {
          if (!res.isSuccess || !res.result) {
            const detail = this.formatApiFailureDetail(res.error);
            this.messageService.add({ severity: 'error', summary: 'Error', detail });
            return EMPTY_CUSTOMERS_TUPLE;
          }
          return [res.result.data, res.result.info] as [Customer[], PagingInfo];
        }),
        catchError((err: unknown) => {
          const message = err instanceof Error ? err.message : 'Unexpected error.';
          this.messageService.add({ severity: 'error', summary: 'Error', detail: message });
          return of(EMPTY_CUSTOMERS_TUPLE);
        })
      )
  });

  readonly displayCustomers = linkedSignal({
    source: () => this.customersLinkSource(),
    computation: (src) => [...src.customers]
  });

  readonly displayPaging = linkedSignal({
    source: () => this.customersLinkSource(),
    computation: (src) => ({ ...src.paging })
  });

  /** Two-way with `app-customer-form-dialog` via `[(visible)]`. */
  modalVisible = model(false);
  modalMode = signal<ModalMode>('create');
  modalSaving = signal(false);
  private editingId = signal<string | null>(null);

  draft = signal<CustomerDraft>({
    name: ''
  });

  openCreateModal(): void {
    this.modalMode.set('create');
    this.editingId.set(null);
    this.draft.set({ name: '' });
    this.modalVisible.set(true);
  }

  openEditModal(customer: Customer): void {
    this.modalMode.set('edit');
    this.editingId.set(customer.id);
    this.draft.set({
      name: customer.name
    });
    this.modalVisible.set(true);
  }

  onModalHide(): void {
    this.modalSaving.set(false);
  }

  submitModal(): void {
    if (this.modalSaving()) {
      return;
    }
    this.modalSaving.set(true);

    const name = this.draft().name.trim();
    const request$ =
      this.modalMode() === 'create'
        ? this.customersApi.createCustomer({ Name: name } satisfies CreateCustomerRequest)
        : this.customersApi.updateCustomer(this.editingId()!, {
            Name: name
          } satisfies UpdateCustomerRequest);

    request$
      .pipe(
        take(1),
        finalize(() => {
          this.modalSaving.set(false);
        })
      )
      .subscribe({
        next: (res) => {
          if (!res.isSuccess || res.result === undefined) {
            const detail = this.formatApiFailureDetail(res.error);
            this.messageService.add({ severity: 'error', summary: 'Error', detail });
            return;
          }
          const action = this.modalMode() === 'create' ? 'created' : 'updated';
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: `Customer ${action} successfully.`
          });
          this.modalVisible.set(false);

          if (this.modalMode() === 'create') {
            if (this.pageIndex() === 0) {
              const created = res.result;
              const pageLen = this.pageSize();
              this.displayCustomers.update((prev) =>
                prev.length >= pageLen
                  ? [created, ...prev.slice(0, pageLen - 1)]
                  : [created, ...prev]
              );
              this.displayPaging.update((p) => ({ ...p, totalCount: p.totalCount + 1 }));
            }
            void this.router.navigate([], {
              relativeTo: this.route,
              queryParams: { page: 1 },
              queryParamsHandling: 'merge',
            });
          } else {
            const updated = res.result;
            this.displayCustomers.update((rows) =>
              rows.map((c) => (c.id === updated.id ? updated : c))
            );
          }
        },
        error: (err: unknown) => {
          const message = err instanceof Error ? err.message : 'Unexpected error.';
          this.messageService.add({ severity: 'error', summary: 'Error', detail: message });
        }
      });
  }

  closeModal(): void {
    this.modalVisible.set(false);
  }

  deleteCustomer(customer: Customer): void {
    if (!confirm(`Are you sure you want to delete "${customer.name}"?`)) return;

    this.messageService.add({
      severity: 'error',
      summary: 'Not supported',
      detail: 'Deleting customers is not supported by the API.'
    });
  }

  onPageChange(event: any): void {
    const rows = event.rows ?? this.pageSize();
    const newPageIndex = event.page ?? Math.floor((event.first ?? 0) / Math.max(rows, 1));

    if (this.pageIndex() !== newPageIndex || this.pageSize() !== rows) {
      const isManualPageChange = this.pageIndex() !== newPageIndex;

      void this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { page: newPageIndex + 1, pageSize: rows },
        queryParamsHandling: 'merge',
      });

      if (isManualPageChange) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }

  private customersLinkSource(): {
    request: ListCustomerRequest;
    customers: Customer[];
    paging: PagingInfo;
  } {
    const [customers, paging] = this.customersResource.value();
    return {
      request: this.listRequest(),
      customers,
      paging
    };
  }

  private formatApiFailureDetail(error: unknown): string {
    if (error === undefined || error === null) {
      return 'The server reported an unsuccessful response.';
    }
    if (typeof error === 'string') return error;
    if (error instanceof Error) return error.message;
    try {
      return JSON.stringify(error);
    } catch {
      return 'The server reported an unsuccessful response.';
    }
  }
}

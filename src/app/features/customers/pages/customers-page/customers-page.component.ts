import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, type OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize, take } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { CustomersMockApiService } from '../../services/customers-mock-api.service';
import type { Customer, CustomerCreateInput } from '../../models/customer';

type CustomerDraft = {
  name: string;
};

type ModalMode = 'create' | 'edit';

@Component({
  selector: 'app-customers-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    TableModule,
    ProgressSpinnerModule,
    SkeletonModule,
    TagModule,
    TooltipModule,
    IconFieldModule,
    InputIconModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './customers-page.component.html'
})
export class CustomersPageComponent implements OnInit {
  readonly pageSizeOptions = [5, 10, 20];

  customers = signal<Customer[]>([]);
  totalRecords = signal(0);

  pageIndex = signal(0);
  pageSize = signal(10);

  isListLoading = signal(true);

  modalVisible = signal(false);
  modalMode = signal<ModalMode>('create');
  modalSaving = signal(false);
  private editingId = signal<string | null>(null);

  draft = signal<CustomerDraft>({
    name: ''
  });

  skeletonRows = computed(() => 
    Array.from({ length: this.pageSize() }, (_, i) => i)
  );

  constructor(
    private readonly customersApi: CustomersMockApiService,
    private readonly cdr: ChangeDetectorRef,
    private readonly messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.loadCustomers();
  }

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
    this.modalSaving.set(true);

    const input: CustomerCreateInput = {
      name: this.draft().name
    };

    const request$ = this.modalMode() === 'create'
      ? this.customersApi.createCustomer(input)
      : this.customersApi.updateCustomer(this.editingId()!, input);

    request$.pipe(
      take(1),
      finalize(() => {
        this.modalSaving.set(false);
      })
    ).subscribe({
      next: () => {
        const action = this.modalMode() === 'create' ? 'created' : 'updated';
        this.messageService.add({ 
            severity: 'success', 
            summary: 'Success', 
            detail: `Customer ${action} successfully.` 
        });
        this.modalVisible.set(false);
        this.pageIndex.set(0);
        this.loadCustomers();
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

    this.customersApi.deleteCustomer(customer.id).pipe(take(1)).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Customer deleted successfully.' });
        this.loadCustomers();
      },
      error: (err: unknown) => {
        const message = err instanceof Error ? err.message : 'Unexpected error.';
        this.messageService.add({ severity: 'error', summary: 'Error', detail: message });
      }
    });
  }

  onPageChange(event: any): void {
    const rows = event.rows ?? this.pageSize();
    const page = event.page ?? Math.floor((event.first ?? 0) / Math.max(rows, 1));
    
    this.pageSize.set(rows);
    this.pageIndex.set(page);
    this.loadCustomers();
  }

  private loadCustomers(): void {
    this.isListLoading.set(true);
    this.customers.set([]);

    this.customersApi.listCustomers(this.pageIndex(), this.pageSize())
      .pipe(
        take(1),
        finalize(() => {
          this.isListLoading.set(false);
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (result) => {
          this.customers.set(result.items);
          this.totalRecords.set(result.total);
        },
        error: (err: unknown) => {
          this.customers.set([]);
          this.totalRecords.set(0);
          const message = err instanceof Error ? err.message : 'Unexpected error.';
          this.messageService.add({ severity: 'error', summary: 'Error', detail: message });
        }
      });
  }
}

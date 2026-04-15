import { ChangeDetectionStrategy, Component, effect, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ToolbarModule } from 'primeng/toolbar';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { BatchesApiService } from '../services/batches-api.service';
import type { Batch, BatchFormSavePayload } from '../models/batch.entity';
import type { BatchesProductRef } from '../models/batches-product.ref';
import type { CreateBatchRequest } from '../models/create-batch.request';
import type { UpdateBatchRequest } from '../models/update-batch.request';
import { BatchListComponent } from './batch-list.component';
import { BatchFormComponent } from './batch-form.component';

@Component({
  selector: 'app-product-batches-panel',
  standalone: true,
  imports: [
    CommonModule,
    DialogModule,
    ToolbarModule,
    ButtonModule,
    BatchListComponent,
    BatchFormComponent
  ],
  template: `
    <div class="flex min-h-[50vh] min-h-0 flex-1 flex-col md:min-h-[60vh]">
      <p-toolbar styleClass="mb-3 border-0 border-b border-border bg-transparent p-0 pb-3">
        <ng-template pTemplate="start">
          <div class="flex items-center gap-2">
            <i class="pi pi-box text-primary"></i>
            <span class="font-semibold text-muted-foreground">Active batches tracking</span>
          </div>
        </ng-template>
        <ng-template pTemplate="end">
          <p-button
            label="Create New Batch"
            icon="pi pi-plus"
            severity="primary"
            (onClick)="openAddForm()">
          </p-button>
        </ng-template>
      </p-toolbar>

      <div class="relative min-h-0 flex-1 overflow-auto">
        <app-batch-list
          [batches]="batches()"
          [totalRecords]="totalRecords()"
          [loading]="loading()"
          [first]="first()"
          [pageSize]="pageSize()"
          [pageSizeOptions]="pageSizeOptions()"
          (onPageChange)="emitPageChange($event)"
          (edit)="openEditForm($event)">
        </app-batch-list>
      </div>
    </div>

    <p-dialog
      [visible]="showForm()"
      (visibleChange)="onDialogVisibleChange($event)"
      [modal]="true"
      [dismissableMask]="true"
      [draggable]="false"
      [closable]="false"
      appendTo="body"
      [baseZIndex]="12500"
      [style]="{ width: '100%', maxWidth: '450px' }"
      [breakpoints]="{ '960px': '75vw', '641px': '90vw' }"
      styleClass="modern-dialog border-border bg-surface shadow-lg">

      <ng-template pTemplate="header">
        <div class="flex w-full items-center justify-between gap-2">
          <div class="flex min-w-0 flex-1 items-center gap-2">
            <i class="pi shrink-0 text-primary" [ngClass]="selectedBatch() ? 'pi-pencil' : 'pi-plus'"></i>
            <span class="truncate text-base font-bold text-foreground">
              {{ selectedBatch() ? 'Update Batch' : 'Add New Batch' }}
            </span>
          </div>
          <p-button
            icon="pi pi-times"
            [text]="true"
            [rounded]="true"
            severity="secondary"
            (onClick)="closeForm()">
          </p-button>
        </div>
      </ng-template>

      <div class="flex min-h-0 max-h-[min(70vh,520px)] flex-col overflow-y-auto px-0.5">
        <app-batch-form
          [batch]="selectedBatch()"
          [loading]="formLoading()"
          (save)="onSave($event)"
          (cancel)="closeForm()">
        </app-batch-form>
      </div>

      <ng-template pTemplate="footer">
        <p class="m-0 text-center text-xs italic text-muted-foreground">
          Changes are tracked for inventory auditing.
        </p>
      </ng-template>
    </p-dialog>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductBatchesPanelComponent {
  private batchesApi = inject(BatchesApiService);
  private messageService = inject(MessageService);

  /** When false, batch list loading is idle and list state is cleared (e.g. modal closed). */
  active = input<boolean>(true);

  product = input<BatchesProductRef | null>(null);

  /** 0-based row offset for server paging (from parent route or modal state). */
  first = input(0);

  /** Page length for API and paginator. */
  pageSize = input(25);

  pageSizeOptions = input<number[]>([25, 50, 100, 200]);

  /** Bubble table/paginator events so the host can update the URL or local paging state. */
  pageChange = output<{ first?: number; rows?: number }>();

  /** Emitted after a batch is created or updated successfully so the host can refresh product aggregates. */
  batchesMutated = output<void>();

  batches = signal<Batch[]>([]);
  totalRecords = signal<number>(0);
  loading = signal<boolean>(false);

  showForm = signal<boolean>(false);
  selectedBatch = signal<Batch | null>(null);
  formLoading = signal<boolean>(false);

  constructor() {
    effect(() => {
      const on = this.active() && this.product();
      if (on) {
        this.loadBatches();
      } else {
        this.closeForm();
        this.batches.set([]);
      }
    });
  }

  emitPageChange(event: { first?: number; rows?: number }): void {
    this.pageChange.emit(event);
  }

  onDialogVisibleChange(visible: boolean): void {
    this.showForm.set(visible);
    if (!visible) {
      this.selectedBatch.set(null);
    }
  }

  loadBatches(): void {
    const p = this.product();
    if (!p) return;

    this.loading.set(true);
    this.batchesApi
      .listBatches({
        ProductId: p.id,
        Skip: this.first(),
        Length: this.pageSize()
      })
      .subscribe({
        next: (body) => {
          this.loading.set(false);
          if (!body.isSuccess || !body.result) {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: body.error?.message ?? 'Failed to load batches'
            });
            return;
          }
          this.batches.set(body.result.data);
          this.totalRecords.set(body.result.info.totalCount);
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load batches' });
          this.loading.set(false);
        }
      });
  }

  openAddForm(): void {
    this.selectedBatch.set(null);
    this.showForm.set(true);
  }

  openEditForm(batch: Batch): void {
    this.selectedBatch.set(batch);
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.selectedBatch.set(null);
  }

  onSave(data: BatchFormSavePayload): void {
    const p = this.product();
    if (!p) return;

    this.formLoading.set(true);
    const batch = this.selectedBatch();

    if (batch) {
      const request: UpdateBatchRequest = {
        Quantity: data.quantity,
        PurchasePrice: data.purchasePrice
      };
      this.batchesApi.updateBatch(batch.id, request).subscribe({
        next: (body) => {
          if (!body.isSuccess) {
            this.handleError(body.error?.message ?? 'Failed to update batch');
            return;
          }
          this.handleSuccess('Batch updated successfully');
        },
        error: () => this.handleError('Failed to update batch')
      });
    } else {
      const request: CreateBatchRequest = {
        ProductId: p.id,
        Quantity: data.quantity,
        PurchasePrice: data.purchasePrice
      };
      this.batchesApi.createBatch(request).subscribe({
        next: (body) => {
          if (!body.isSuccess) {
            this.handleError(body.error?.message ?? 'Failed to create batch');
            return;
          }
          this.handleSuccess('Batch created successfully');
        },
        error: () => this.handleError('Failed to create batch')
      });
    }
  }

  private handleSuccess(message: string): void {
    this.messageService.add({ severity: 'success', summary: 'Success', detail: message });
    this.formLoading.set(false);
    this.closeForm();
    this.loadBatches();
    this.batchesMutated.emit();
  }

  private handleError(message: string): void {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: message });
    this.formLoading.set(false);
  }
}

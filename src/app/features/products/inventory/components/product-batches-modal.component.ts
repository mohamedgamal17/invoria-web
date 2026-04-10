import { ChangeDetectionStrategy, Component, effect, inject, input, model, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { DrawerModule } from 'primeng/drawer';
import { ToolbarModule } from 'primeng/toolbar';
import { TagModule } from 'primeng/tag';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { BatchService } from '../services/batch.service';
import { Batch, BatchCreateInput, BatchUpdateInput } from '../models/batch.model';
import { Product } from '../../models/product.entity';
import { BatchListComponent } from './batch-list.component';
import { BatchFormComponent } from './batch-form.component';

@Component({
  selector: 'app-product-batches-modal',
  standalone: true,
  imports: [
    CommonModule,
    DialogModule,
    DrawerModule,
    ToolbarModule,
    TagModule,
    ButtonModule,
    ToastModule,
    BatchListComponent,
    BatchFormComponent
  ],
  template: `
    <p-dialog
      [(visible)]="visible"
      [modal]="true"
      [style]="{ width: '92vw', maxWidth: '920px', height: '86vh' }"
      [draggable]="false"
      [resizable]="false"
      (onHide)="closeModal()"
      appendTo="body"
      [styleClass]="'rounded-2xl overflow-hidden shadow-lg border-0'"
      [contentStyleClass]="'flex flex-col min-h-0 h-full overflow-hidden bg-surface p-4 md:p-5'">

      <ng-template pTemplate="header">
        <div class="flex flex-col gap-1">
          <span class="text-xs font-bold uppercase tracking-widest text-primary">Inventory Management</span>
          <div class="flex min-w-0 flex-wrap items-center gap-2">
            <h2 class="m-0 max-w-full truncate text-2xl font-extrabold leading-none text-foreground md:text-3xl">
              {{ product()?.name }}
            </h2>
            @if (product()?.code) {
              <p-tag [value]="product()!.code" severity="secondary" styleClass="text-xs font-mono shrink-0" />
            }
          </div>
        </div>
      </ng-template>

      <div class="flex min-h-0 flex-1 flex-col">
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
            [pageSize]="pageSize"
            (onPageChange)="onPageChange($event)"
            (edit)="openEditForm($event)">
          </app-batch-list>
        </div>
      </div>
    </p-dialog>

    <p-drawer
      [visible]="showForm()"
      (visibleChange)="onDrawerVisibleChange($event)"
      position="right"
      [modal]="true"
      [dismissible]="true"
      [closable]="false"
      appendTo="body"
      [baseZIndex]="12000"
      [style]="{ width: 'min(100vw, 400px)' }"
      styleClass="border-l border-border bg-surface shadow-lg">

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

      <div class="flex min-h-0 flex-1 flex-col overflow-y-auto px-1">
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
    </p-drawer>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductBatchesModalComponent {
  private batchService = inject(BatchService);
  private messageService = inject(MessageService);

  visible = model(false);
  product = input<Product | null>(null);

  batches = signal<Batch[]>([]);
  totalRecords = signal<number>(0);
  loading = signal<boolean>(false);

  showForm = signal<boolean>(false);
  selectedBatch = signal<Batch | null>(null);
  formLoading = signal<boolean>(false);

  pageSize = 5;
  currentPage = 1;

  constructor() {
    effect(() => {
      if (this.visible() && this.product()) {
        this.loadBatches();
      }
    });
  }

  onDrawerVisibleChange(visible: boolean): void {
    this.showForm.set(visible);
    if (!visible) {
      this.selectedBatch.set(null);
    }
  }

  loadBatches() {
    const p = this.product();
    if (!p) return;

    this.loading.set(true);
    this.batchService.getBatches(p.id, this.currentPage, this.pageSize)
      .subscribe({
        next: (response) => {
          this.batches.set(response.items);
          this.totalRecords.set(response.total);
          this.loading.set(false);
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load batches' });
          this.loading.set(false);
        }
      });
  }

  onPageChange(event: { first?: number; rows?: number }) {
    const first = event.first ?? 0;
    const rows = event.rows ?? this.pageSize;
    this.currentPage = Math.floor(first / Math.max(rows, 1)) + 1;
    this.loadBatches();
  }

  openAddForm() {
    this.selectedBatch.set(null);
    this.showForm.set(true);
  }

  openEditForm(batch: Batch) {
    this.selectedBatch.set(batch);
    this.showForm.set(true);
  }

  closeForm() {
    this.showForm.set(false);
    this.selectedBatch.set(null);
  }

  closeModal() {
    this.visible.set(false);
    this.closeForm();
    this.batches.set([]);
  }

  onSave(data: BatchCreateInput | BatchUpdateInput) {
    const p = this.product();
    if (!p) return;

    this.formLoading.set(true);
    const batch = this.selectedBatch();

    if (batch) {
      this.batchService.updateBatch(batch.id, data as BatchUpdateInput)
        .subscribe({
          next: () => {
            this.handleSuccess('Batch updated successfully');
          },
          error: () => this.handleError('Failed to update batch')
        });
    } else {
      this.batchService.createBatch(p.id, data as BatchCreateInput)
        .subscribe({
          next: () => {
            this.handleSuccess('Batch created successfully');
          },
          error: () => this.handleError('Failed to create batch')
        });
    }
  }

  private handleSuccess(message: string) {
    this.messageService.add({ severity: 'success', summary: 'Success', detail: message });
    this.formLoading.set(false);
    this.closeForm();
    this.loadBatches();
  }

  private handleError(message: string) {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: message });
    this.formLoading.set(false);
  }
}

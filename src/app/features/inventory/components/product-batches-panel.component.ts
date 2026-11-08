import { ChangeDetectionStrategy, Component, effect, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import type { Batch, BatchFormSavePayload } from '../models/batch.entity';
import type { SaveBatchEvent } from '../models/save-batch.event';
import type { LoadStatus } from '../../../shared/models/load-status';
import { BatchListComponent } from './batch-list.component';
import { BatchFormComponent } from './batch-form.component';
import { DEFAULT_PAGE_SIZE_OPTIONS } from '../../../shared/models/pagination';

/**
 * Presentational batches panel: dialog + list. All batches state (fetch,
 * paging, create/update mutations) is provided by the host page from its
 * NgRx store — this component performs no API calls.
 */
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
          [loading]="saving()"
          (save)="emitSave($event)"
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
  /** Current API page of batches (owned and fetched by the host page's store). */
  batches = input<Batch[]>([]);

  /** Batches page request is in flight. */
  loading = input(false);

  /** A create/update batch mutation is in flight (dialog submit spinner). */
  saving = input(false);

  /**
   * Status round marker of the save mutation (`null` while idle): a `loaded`
   * round closes the dialog; an `error` round keeps it open for corrections.
   */
  saveStatus = input<LoadStatus | null>(null);

  totalRecords = input(0);

  /** 0-based row offset for server paging ( paginator `first`). */
  first = input(0);

  /** Page length for API and paginator. */
  pageSize = input(25);

  pageSizeOptions = input<number[]>(DEFAULT_PAGE_SIZE_OPTIONS);

  /** Bubble table/paginator events so the host can dispatch store page-change actions. */
  pageChange = output<{ first?: number; rows?: number }>();

  /** Opened the edit dialog for an existing batch. */
  edit = output<Batch>();

  /** Dialog form submitted (create when `batch` is null, update otherwise). */
  save = output<SaveBatchEvent>();

  showForm = signal<boolean>(false);
  selectedBatch = signal<Batch | null>(null);

  constructor() {
    effect(() => {
      if (this.saveStatus() === 'loaded') {
        this.closeForm();
      }
    });
  }

  emitPageChange(event: { first?: number; rows?: number }): void {
    this.pageChange.emit(event);
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

  onDialogVisibleChange(visible: boolean): void {
    this.showForm.set(visible);
    if (!visible) {
      this.selectedBatch.set(null);
    }
  }

  emitSave(payload: BatchFormSavePayload): void {
    this.save.emit({ batch: this.selectedBatch(), payload });
  }
}

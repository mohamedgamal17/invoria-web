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
    BatchFormComponent,
  ],
  templateUrl: './product-batches-panel.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
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

import { ChangeDetectionStrategy, Component, computed, input, model, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import type { BatchesProductRef } from '../models/batches-product.ref';
import { ProductBatchesPanelComponent } from './product-batches-panel.component';
import { DEFAULT_PAGE_SIZE_OPTIONS } from '../../../shared/models/pagination';

/**
 * Stateless batches modal. The batches fetch/mutations live in the host
 * page's store; this dialog only hosts the presentational panel with local
 * dialog paging state. (Currently navigable nowhere — kept as legacy UI.)
 */
@Component({
  selector: 'app-product-batches-modal',
  standalone: true,
  imports: [CommonModule, DialogModule, ProductBatchesPanelComponent],
  templateUrl: './product-batches-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductBatchesModalComponent {
  visible = model(false);
  product = input<BatchesProductRef | null>(null);

  readonly pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS;
  readonly first = signal(0);
  readonly pageSize = signal(25);

  readonly panelActive = computed(() => this.visible() && !!this.product());

  onDialogHide(): void {
    this.visible.set(false);
    this.first.set(0);
    this.pageSize.set(25);
  }

  onPanelPageChange(event: { first?: number; rows?: number }): void {
    const nextFirst = event.first ?? 0;
    const rows = event.rows ?? this.pageSize();
    this.first.set(nextFirst);
    this.pageSize.set(rows);
  }
}

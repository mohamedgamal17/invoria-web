import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
  output,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import type { BatchesProductRef } from '../models/batches-product.ref';
import { ProductBatchesPanelComponent } from './product-batches-panel.component';

@Component({
  selector: 'app-product-batches-modal',
  standalone: true,
  imports: [CommonModule, DialogModule, TagModule, ProductBatchesPanelComponent],
  template: `
    <p-dialog
      [(visible)]="visible"
      [modal]="true"
      [style]="{ width: '92vw', maxWidth: '920px', height: '86vh' }"
      [draggable]="false"
      [resizable]="false"
      (onHide)="onDialogHide()"
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

      <app-product-batches-panel
        [product]="product()"
        [active]="panelActive()"
        [first]="first()"
        [pageSize]="pageSize()"
        [pageSizeOptions]="pageSizeOptions"
        (pageChange)="onPanelPageChange($event)"
        (batchesMutated)="batchesMutated.emit()"
      />
    </p-dialog>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductBatchesModalComponent {
  visible = model(false);
  product = input<BatchesProductRef | null>(null);
  batchesMutated = output<void>();

  readonly pageSizeOptions = [25, 50, 100, 200];
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

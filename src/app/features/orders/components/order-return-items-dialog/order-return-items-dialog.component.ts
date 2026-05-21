import { CommonModule } from '@angular/common';
import { Component, computed, input, model, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';

import type { AddReturnItemsRequest } from '../../models/add-return-items.request';
import {
  addAllOrderLinesToReturnDraft,
  clampReturnQuantity,
  hasDuplicateProductNamesInDraft,
  isReturnDraftValid,
  mergeReturnDraftLine,
  normalizeReturnDraftForSubmit,
  orderLineSelectOptions,
  type ReturnDraftLine,
  type ReturnOrderLineOption
} from '../../models/order-return-items';
import { mapReturnItemsToDraft } from '../../models/order-return-items';
import type { UiOrderItem, UiReturnItem } from '../../models/order-ui.model';

@Component({
  selector: 'app-order-return-items-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    InputNumberModule,
    SelectModule,
    TableModule
  ],
  templateUrl: './order-return-items-dialog.component.html',
  styleUrl: './order-return-items-dialog.component.css'
})
export class OrderReturnItemsDialogComponent {
  visible = model(false);
  orderItems = input<UiOrderItem[]>([]);
  existingReturnItems = input<UiReturnItem[]>([]);
  saving = input(false);

  submitRequest = output<AddReturnItemsRequest>();
  cancel = output<void>();

  readonly draftLines = signal<ReturnDraftLine[]>([]);
  readonly selectedLine = signal<ReturnOrderLineOption | null>(null);
  readonly lineQuantity = signal(1);
  readonly formError = signal<string | null>(null);

  readonly lineOptions = computed(() => orderLineSelectOptions(this.orderItems()));

  readonly selectedLineMax = computed(() => this.selectedLine()?.maxQuantity ?? 1);

  readonly canSubmit = computed(() => isReturnDraftValid(this.draftLines()));

  readonly hasOrderLines = computed(() => this.orderItems().length > 0);

  readonly isEditMode = computed(() => this.existingReturnItems().length > 0);

  readonly dialogHeader = computed(() =>
    this.isEditMode() ? 'Edit return items' : 'Return order items'
  );

  readonly helperText = computed(() =>
    this.isEditMode()
      ? 'Update quantities returned against shipped line items. The full return list is replaced when you save.'
      : 'Record quantities being returned against shipped line items. Search by product name; each line is tracked separately when the same product appears more than once.'
  );

  readonly submitLabel = computed(() => (this.isEditMode() ? 'Save changes' : 'Submit returns'));

  showDraftLineHint(row: ReturnDraftLine): boolean {
    if (!hasDuplicateProductNamesInDraft(this.draftLines())) {
      return false;
    }
    return this.draftLines().filter((d) => d.productName === row.productName).length > 1;
  }

  onDialogShow(): void {
    const existing = this.existingReturnItems();
    if (existing.length > 0) {
      this.draftLines.set(mapReturnItemsToDraft(existing));
      this.selectedLine.set(null);
      this.lineQuantity.set(1);
      this.formError.set(null);
      return;
    }
    this.resetForm();
  }

  onHide(): void {
    this.resetForm();
    this.visible.set(false);
  }

  onCancel(): void {
    this.visible.set(false);
    this.cancel.emit();
  }

  onLineChange(option: ReturnOrderLineOption | null): void {
    this.selectedLine.set(option);
    this.lineQuantity.set(1);
    this.formError.set(null);
  }

  applyMaxQuantity(): void {
    const max = this.selectedLineMax();
    this.lineQuantity.set(max);
  }

  addLine(): void {
    const option = this.selectedLine();
    if (!option) {
      this.formError.set('Select an order line to return.');
      return;
    }

    const qty = clampReturnQuantity(this.lineQuantity(), option.maxQuantity);
    this.draftLines.update((draft) =>
      mergeReturnDraftLine(draft, {
        orderItemId: option.orderItemId,
        productName: option.productName,
        quantity: qty,
        maxQuantity: option.maxQuantity
      })
    );
    this.formError.set(null);
    this.selectedLine.set(null);
    this.lineQuantity.set(1);
  }

  addAllLines(): void {
    this.draftLines.update((draft) => addAllOrderLinesToReturnDraft(draft, this.orderItems()));
    this.formError.set(null);
  }

  removeLine(orderItemId: string): void {
    this.draftLines.update((draft) => draft.filter((d) => d.orderItemId !== orderItemId));
  }

  updateDraftQuantity(orderItemId: string, quantity: number | null): void {
    if (quantity === null || quantity === undefined) {
      return;
    }
    this.draftLines.update((draft) =>
      draft.map((row) =>
        row.orderItemId === orderItemId
          ? { ...row, quantity: clampReturnQuantity(quantity, row.maxQuantity) }
          : row
      )
    );
  }

  applyRowMax(orderItemId: string): void {
    this.draftLines.update((draft) =>
      draft.map((row) =>
        row.orderItemId === orderItemId ? { ...row, quantity: row.maxQuantity } : row
      )
    );
  }

  onSubmit(): void {
    if (!this.canSubmit()) {
      this.formError.set('Add at least one valid return line before submitting.');
      return;
    }
    this.submitRequest.emit(normalizeReturnDraftForSubmit(this.draftLines()));
  }

  private resetForm(): void {
    this.draftLines.set([]);
    this.selectedLine.set(null);
    this.lineQuantity.set(1);
    this.formError.set(null);
  }
}

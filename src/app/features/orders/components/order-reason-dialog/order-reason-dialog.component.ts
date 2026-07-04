import { Component, input, output, model } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';
import type { UiOrder } from '../../models/order-ui.model';
import type { OrderStatus } from '../../models/order.entity';
import { OrderStatus as OrderStatusEnum } from '../../models/order.entity';

@Component({
  selector: 'app-order-reason-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    TextareaModule
  ],
  template: `
    <p-dialog
      [header]="'Why are you ' + (transitionTarget()?.state === OrderStatusEnum.Cancelled ? 'cancelling' : 'refusing') + ' this order?'"
      [(visible)]="visible"
      [modal]="true"
      [dismissableMask]="true"
      [draggable]="false"
      [breakpoints]="{ '641px': '90vw' }"
      (onHide)="onHide()"
      styleClass="modern-dialog w-full max-w-[450px]"
    >
      <div class="space-y-4 pt-2">
        <div class="flex flex-col gap-2">
          <label class="text-xs font-bold text-muted-foreground uppercase tracking-wider" for="reason">Reason</label>
          <textarea
            id="reason"
            name="reason"
            pTextarea
            [ngModel]="reasonText()"
            (ngModelChange)="reasonText.set($event); reasonTextChange.emit($event)"
            rows="4"
            class="w-full rounded-lg border-border bg-surface-2 focus:ring-2 focus:ring-focus transition-all p-3 text-sm resize-none"
            [disabled]="saving()"
            [placeholder]="'Please provide a reason...'"
          ></textarea>
          @if (!reasonText().trim() && !saving()) {
            <small class="text-danger text-[10px] font-medium">* Reason is required to proceed</small>
          }
        </div>

        <div class="flex items-center justify-end gap-3 pt-4 border-t border-border mt-4">
          <p-button
            label="Keep Order"
            type="button"
            [text]="true"
            styleClass="px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted rounded-lg transition-colors"
            [disabled]="saving()"
            (onClick)="cancel.emit()"
          />

          <p-button
            [label]="transitionTarget()?.state === OrderStatusEnum.Cancelled ? 'Confirm Cancellation' : 'Confirm Refusal'"
            type="button"
            severity="danger"
            [disabled]="saving() || !reasonText().trim()"
            [loading]="saving()"
            styleClass="px-6 py-2.5 bg-danger text-danger-foreground text-sm font-bold rounded-lg shadow-sm hover:opacity-90 transition-all focus:ring-2 focus:ring-focus"
            (onClick)="reasonSubmit.emit()"
          />
        </div>
      </div>
    </p-dialog>
  `
})
export class OrderReasonDialogComponent {
  protected readonly OrderStatusEnum = OrderStatusEnum;

  visible = model(false);
  transitionTarget = input<{ order: UiOrder; state: OrderStatus } | null>(null);
  reasonText = model('');
  saving = input(false);

  reasonTextChange = output<string>(); // Kept for compatibility
  reasonSubmit = output<void>();
  cancel = output<void>();

  onHide() {
    this.visible.set(false);
  }
}

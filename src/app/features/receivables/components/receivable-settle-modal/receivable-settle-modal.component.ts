import { Component, computed, effect, inject, input, model, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { MessageModule } from 'primeng/message';

import type { Receivable } from '../../models/receivable.entity';

@Component({
  selector: 'app-receivable-settle-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DialogModule, ButtonModule, InputNumberModule, MessageModule],
  templateUrl: './receivable-settle-modal.component.html'
})
export class ReceivableSettleModalComponent {
  visible = model<boolean>(false);
  receivable = input<Receivable | null>(null);
  currencyCode = input<string>('EGP');
  settling = input<boolean>(false);

  /** Emits the validated settlement amount. */
  settle = output<number>();
  cancel = output<void>();
  hide = output<void>();

  private readonly formBuilder = inject(FormBuilder);

  readonly form = this.formBuilder.group({
    amount: this.formBuilder.nonNullable.control(0, [Validators.required, Validators.min(0.01)])
  });

  readonly maxAmount = computed(() => this.receivable()?.outstandingAmount ?? 0);

  constructor() {
    effect(() => {
      const visible = this.visible();
      if (visible) {
        this.form.reset({ amount: 0 });
      }
    });
  }

  /** True when the entered amount exceeds the outstanding balance. */
  exceedsOutstanding(): boolean {
    const amount = this.form.controls.amount.value;
    return amount !== null && amount > this.maxAmount();
  }

  fillOutstanding(): void {
    const max = this.maxAmount();
    if (max > 0) {
      this.form.controls.amount.setValue(max);
      this.form.controls.amount.markAsDirty();
    }
  }

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.exceedsOutstanding()) {
      return;
    }
    this.settle.emit(this.form.controls.amount.value);
  }

  onHide(): void {
    this.hide.emit();
  }
}

import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, input, model, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { MessageModule } from 'primeng/message';

import { DEFAULT_CURRENCY_CODE } from '../../models/currency';

/**
 * Settlement dialog shared by payables and receivables: validates an amount
 * against the outstanding balance and emits it only when valid.
 */
@Component({
  selector: 'app-settle-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    InputNumberModule,
    MessageModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './settle-modal.component.html'
})
export class SettleModalComponent {
  visible = model<boolean>(false);
  outstandingAmount = input<number>(0);
  currencyCode = input<string>(DEFAULT_CURRENCY_CODE);
  settling = input<boolean>(false);

  settle = output<number>();
  cancel = output<void>();

  private readonly formBuilder = inject(FormBuilder);

  readonly form = this.formBuilder.group({
    amount: this.formBuilder.nonNullable.control(0, [Validators.required, Validators.min(0.01)])
  });

  readonly maxAmount = computed(() => this.outstandingAmount());

  constructor() {
    effect(() => {
      const visible = this.visible();
      if (visible) {
        this.form.reset({ amount: 0 });
      }
    });

    effect(() => {
      if (this.settling()) {
        this.form.disable({ emitEvent: false });
      } else {
        this.form.enable({ emitEvent: false });
      }
    });
  }

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
}

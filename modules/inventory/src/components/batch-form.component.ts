import { ChangeDetectionStrategy, Component, effect, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { MessageModule } from 'primeng/message';
import { DividerModule } from 'primeng/divider';
import { DEFAULT_CURRENCY_CODE } from '@invoria/utils';
import type { Batch, BatchFormSavePayload } from '../models/batch.entity';

@Component({
  selector: 'app-batch-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputNumberModule,
    MessageModule,
    DividerModule,
  ],
  templateUrl: './batch-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BatchFormComponent {
  private readonly formBuilder = inject(FormBuilder);

  batch = input<Batch | null>(null);
  loading = input<boolean>(false);
  currencyCode = input<string>(DEFAULT_CURRENCY_CODE);

  save = output<BatchFormSavePayload>();
  cancel = output<void>();

  editMode = () => !this.batch();

  batchForm = this.formBuilder.group({
    quantity: [1, [Validators.required, Validators.min(1)]],
    purchasePrice: [1, [Validators.required, Validators.min(0.01)]],
  });

  constructor() {
    effect(() => {
      if (this.loading()) {
        this.batchForm.disable({ emitEvent: false });
      } else {
        this.batchForm.enable({ emitEvent: false });
      }
    });

    effect(() => {
      const batch = this.batch();
      const qtyControl = this.batchForm.get('quantity');
      const priceControl = this.batchForm.get('purchasePrice');

      if (batch) {
        qtyControl?.setValidators([Validators.required, Validators.min(0)]);
        qtyControl?.updateValueAndValidity({ emitEvent: false });

        this.batchForm.patchValue(
          { quantity: batch.quantity ?? 0, purchasePrice: batch.purchasePrice ?? 1 },
          { emitEvent: false },
        );
        priceControl?.enable({ emitEvent: false });
      } else {
        qtyControl?.setValidators([Validators.required, Validators.min(1)]);
        qtyControl?.updateValueAndValidity({ emitEvent: false });

        priceControl?.enable({ emitEvent: false });
        this.batchForm.patchValue({ quantity: 1, purchasePrice: 1 }, { emitEvent: false });
      }

      this.batchForm.markAsPristine();
      this.batchForm.markAsUntouched();
    });
  }

  submit(): void {
    if (this.batchForm.valid) {
      if (this.editMode()) {
        this.save.emit({
          quantity: this.batchForm.value.quantity ?? 0,
          purchasePrice: this.batchForm.value.purchasePrice ?? 1,
        });
      } else {
        this.save.emit({
          quantity: this.batchForm.value.quantity ?? 1,
          purchasePrice: this.batchForm.value.purchasePrice ?? 1,
        });
      }
    }
  }
}

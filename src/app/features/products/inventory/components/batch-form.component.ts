import { ChangeDetectionStrategy, Component, effect, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { MessageModule } from 'primeng/message';
import { DividerModule } from 'primeng/divider';
import { Batch, BatchCreateInput, BatchUpdateInput } from '../models/batch.model';

@Component({
  selector: 'app-batch-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputNumberModule,
    MessageModule,
    DividerModule
  ],
  template: `
    <form [formGroup]="batchForm" (ngSubmit)="submit()" class="flex h-full min-h-0 flex-col gap-4">
      <div class="flex min-h-0 flex-1 flex-col gap-4">
        <div class="flex flex-col gap-2">
          <label for="quantity" class="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Stock quantity
          </label>
          <p-inputNumber
            id="quantity"
            formControlName="quantity"
            [min]="editMode() ? 0 : 1"
            [showButtons]="true"
            buttonLayout="horizontal"
            spinnerMode="horizontal"
            decrementButtonIcon="pi pi-minus"
            incrementButtonIcon="pi pi-plus"
            inputStyleClass="w-full"
            styleClass="w-full">
          </p-inputNumber>
          @if (batchForm.get('quantity')?.invalid && batchForm.get('quantity')?.touched) {
            <p-message
              severity="error"
              [text]="'Quantity must be at least ' + (editMode() ? '0' : '1') + '.'"
              styleClass="w-full text-sm" />
          }
        </div>

        <div class="flex flex-col gap-2">
          <label for="purchasePrice" class="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Unit purchase price
          </label>
          <p-inputNumber
            id="purchasePrice"
            formControlName="purchasePrice"
            mode="currency"
            currency="USD"
            locale="en-US"
            [min]="0.01"
            inputStyleClass="w-full"
            styleClass="w-full">
          </p-inputNumber>
          @if (batchForm.get('purchasePrice')?.invalid && batchForm.get('purchasePrice')?.touched) {
            <p-message severity="error" text="Price must be greater than zero." styleClass="w-full text-sm" />
          }
        </div>
      </div>

      <p-divider styleClass="m-0 border-border" />

      <div class="flex flex-col gap-2">
        <p-button
          [label]="editMode() ? 'Save Changes' : 'Create Batch'"
          [icon]="editMode() ? 'pi pi-save' : 'pi pi-check'"
          type="submit"
          [loading]="loading()"
          [disabled]="batchForm.invalid || loading()"
          styleClass="w-full">
        </p-button>
        <p-button
          label="Cancel"
          icon="pi pi-times"
          [text]="true"
          severity="secondary"
          styleClass="w-full"
          (onClick)="cancel.emit()">
        </p-button>
      </div>
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BatchFormComponent {
  private fb = inject(FormBuilder);

  batch = input<Batch | null>(null);
  loading = input<boolean>(false);

  save = output<BatchCreateInput | BatchUpdateInput>();
  cancel = output<void>();

  editMode = () => !!this.batch();

  batchForm = this.fb.group({
    quantity: [1, [Validators.required, Validators.min(1)]],
    purchasePrice: [1, [Validators.required, Validators.min(0.01)]]
  });

  constructor() {
    effect(() => {
      const b = this.batch();
      const qtyControl = this.batchForm.get('quantity');
      const priceControl = this.batchForm.get('purchasePrice');

      if (b) {
        qtyControl?.setValidators([Validators.required, Validators.min(0)]);
        qtyControl?.updateValueAndValidity({ emitEvent: false });

        this.batchForm.patchValue({ quantity: b.quantity ?? 0, purchasePrice: b.purchasePrice ?? 1 }, { emitEvent: false });
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

  submit() {
    if (this.batchForm.valid) {
      if (this.editMode()) {
        this.save.emit({
          quantity: this.batchForm.value.quantity ?? 0,
          purchasePrice: this.batchForm.value.purchasePrice ?? 1
        } as BatchUpdateInput);
      } else {
        this.save.emit({
          quantity: this.batchForm.value.quantity ?? 1,
          purchasePrice: this.batchForm.value.purchasePrice ?? 1
        } as BatchCreateInput);
      }
    }
  }
}

import { Component, model, input, output, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { MessageModule } from 'primeng/message';

import type { Product } from '../../models/product.entity';

export type ProductDraft = {
  name: string;
  code: string;
  price: number;
};

export type ModalMode = 'create' | 'edit';

@Component({
  selector: 'app-product-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    MessageModule
  ],
  templateUrl: './product-dialog.component.html'
})
export class ProductDialogComponent {
  visible = model<boolean>(false);
  mode = input.required<ModalMode>();
  product = input<Product | null>(null);
  saving = input<boolean>(false);

  save = output<ProductDraft>();
  cancel = output<void>();
  hide = output<void>();

  private readonly formBuilder = inject(FormBuilder);

  readonly form = this.formBuilder.group({
    name: this.formBuilder.nonNullable.control('', [Validators.required, Validators.maxLength(120)]),
    code: this.formBuilder.nonNullable.control('', [Validators.required, Validators.maxLength(40)]),
    price: this.formBuilder.nonNullable.control(0, [Validators.required, Validators.min(0.01)])
  });

  constructor() {
    effect(() => {
      const p = this.product();
      if (p) {
        this.form.reset({
          name: p.name,
          code: p.code,
          price: p.price
        });
      } else {
        this.form.reset({
          name: '',
          code: '',
          price: 0
        });
      }
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.getRawValue();
    this.save.emit({
      name: formValue.name,
      code: formValue.code.trim().toUpperCase(),
      price: formValue.price
    });
  }

  onHide(): void {
    this.hide.emit();
  }
}

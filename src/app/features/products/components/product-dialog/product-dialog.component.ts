import { Component, model, input, output, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';

import type { Product } from '../../models/product';

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
    FormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule
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

  draft = signal<ProductDraft>({
    name: '',
    code: '',
    price: 0
  });

  constructor() {
    effect(() => {
      const p = this.product();
      if (p) {
        this.draft.set({
          name: p.name,
          code: p.code,
          price: p.price
        });
      } else {
        this.draft.set({
          name: '',
          code: '',
          price: 0
        });
      }
    });
  }

  submit(): void {
    this.save.emit(this.draft());
  }

  onHide(): void {
    this.hide.emit();
  }
}

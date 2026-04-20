import { CommonModule } from '@angular/common';
import {
  Component,
  effect,
  forwardRef,
  inject,
  input,
  signal
} from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';

import type { Product } from '../../../products/models/product.entity';
import { productSearchListRequest } from '../../../products/models/list-product.request';
import { ProductsApiService } from '../../../products/services/products-api.service';

/** Optional label when the parent only has an id (e.g. purchase order line). */
export type ResolvedProductRef = Pick<Product, 'id' | 'name' | 'code'>;

function productDisplayStub(id: string, name: string, code: string): Product {
  return {
    id,
    name,
    code,
    price: 0,
    stock: {
      actualQuantity: 0,
      reservedQuantity: 0
    },
    createdAt: ''
  };
}

@Component({
  selector: 'app-product-id-control',
  standalone: true,
  imports: [CommonModule, FormsModule, AutoCompleteModule, ButtonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ProductIdControlComponent),
      multi: true
    }
  ],
  templateUrl: './product-id-control.component.html'
})
export class ProductIdControlComponent implements ControlValueAccessor {
  private readonly productsApi = inject(ProductsApiService);

  readonly resolvedProduct = input<ResolvedProductRef | null>(null);
  readonly saving = input(false);
  /** Unique row index when used inside a FormArray (stable autocomplete name). */
  readonly rowIndex = input<number>(0);

  readonly selectedProduct = signal<Product | null>(null);
  readonly suggestions = signal<Product[]>([]);

  private currentId = '';
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};
  private disabledFromCva = false;

  constructor() {
    effect(() => {
      const ref = this.resolvedProduct();
      if (!this.currentId || !ref || ref.id !== this.currentId) {
        return;
      }
      this.selectedProduct.set(
        productDisplayStub(ref.id, ref.name, (ref.code ?? '').trim())
      );
    });
  }

  isControlDisabled(): boolean {
    return this.disabledFromCva || this.saving();
  }

  writeValue(value: string | null): void {
    this.currentId = (value ?? '').trim();
    if (!this.currentId) {
      this.selectedProduct.set(null);
      return;
    }
    const ref = this.resolvedProduct();
    if (ref?.id === this.currentId) {
      this.selectedProduct.set(
        productDisplayStub(ref.id, ref.name, (ref.code ?? '').trim())
      );
    } else {
      this.selectedProduct.set(productDisplayStub(this.currentId, this.currentId, ''));
    }
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabledFromCva = isDisabled;
  }

  onComplete(event: { query: string }): void {
    this.productsApi.searchProducts(productSearchListRequest, event.query).subscribe({
      next: (rows) => this.suggestions.set(rows),
      error: () => this.suggestions.set([])
    });
  }

  /** PrimeNG may not run `completeMethod` until the user types; load the first page on first focus/click. */
  onInputFocus(): void {
    this.onComplete({ query: '' });
  }

  onModelChange(product: Product | null): void {
    this.selectedProduct.set(product);
    if (!product?.id) {
      if (this.currentId !== '') {
        this.currentId = '';
        this.onChange('');
      }
      return;
    }
    this.currentId = product.id;
    this.onChange(product.id);
    this.onTouched();
  }

  clearSelection(): void {
    this.currentId = '';
    this.selectedProduct.set(null);
    this.suggestions.set([]);
    this.onChange('');
    this.onTouched();
  }

  markTouched(): void {
    this.onTouched();
  }
}

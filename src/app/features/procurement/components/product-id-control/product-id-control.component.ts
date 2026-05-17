import { CommonModule } from '@angular/common';
import {
  Component,
  DestroyRef,
  effect,
  forwardRef,
  inject,
  input,
  signal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { Subject, catchError, debounceTime, finalize, of, switchMap, tap } from 'rxjs';

import type { Product } from '../../../products/models/product.entity';
import { productSearchListRequest } from '../../../products/models/list-product.request';
import { ProductsApiService } from '../../../products/services/products-api.service';

/** Optional label when the parent only has an id (e.g. purchase order line). */
export type ResolvedProductRef = Pick<Product, 'id' | 'name'>;

function productDisplayStub(id: string, name: string): Product {
  return {
    id,
    name,
    price: 0,
    stock: {
      actualQuantity: 0,
      reservedQuantity: 0
    },
    createdAt: ''
  };
}

/** Mirrors filter-panel / order-form autocomplete debounce (e.g. products-filter-panel). */
const PRODUCT_AUTOCOMPLETE_DEBOUNCE_MS = 300;

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
  private readonly destroyRef = inject(DestroyRef);
  private readonly productsApi = inject(ProductsApiService);
  private readonly productQuery$ = new Subject<string>();

  readonly resolvedProduct = input<ResolvedProductRef | null>(null);
  readonly saving = input(false);
  /** Unique row index when used inside a FormArray (stable autocomplete name). */
  readonly rowIndex = input<number>(0);

  readonly selectedProduct = signal<Product | null>(null);
  readonly suggestions = signal<Product[]>([]);
  readonly searching = signal(false);

  private currentId = '';
  private readonly searchResultsByQuery = new Map<string, Product[]>();
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};
  private disabledFromCva = false;

  constructor() {
    effect(() => {
      const ref = this.resolvedProduct();
      if (!this.currentId || !ref || ref.id !== this.currentId) {
        return;
      }
      this.selectedProduct.set(productDisplayStub(ref.id, ref.name));
    });

    this.productQuery$
      .pipe(
        debounceTime(PRODUCT_AUTOCOMPLETE_DEBOUNCE_MS),
        switchMap((query) =>
          this.productsApi.searchProducts(productSearchListRequest, query).pipe(
            tap((rows) => this.searchResultsByQuery.set(query, rows)),
            catchError(() => of([] as Product[])),
            finalize(() => this.searching.set(false))
          )
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((rows) => this.suggestions.set(rows));
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
      this.selectedProduct.set(productDisplayStub(ref.id, ref.name));
    } else {
      this.selectedProduct.set(productDisplayStub(this.currentId, this.currentId));
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
    this.requestSearch((event.query ?? '').trim());
  }

  /** PrimeNG may not run `completeMethod` until the user types; load the first page on first focus/click. */
  onInputFocus(): void {
    this.requestSearch('');
  }

  private requestSearch(query: string): void {
    const cached = this.searchResultsByQuery.get(query);
    if (cached !== undefined) {
      this.suggestions.set([...cached]);
      this.searching.set(false);
      return;
    }
    this.searching.set(true);
    this.productQuery$.next(query);
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
    this.searchResultsByQuery.clear();
    this.searching.set(false);
    this.selectedProduct.set(null);
    this.suggestions.set([]);
    this.onChange('');
    this.onTouched();
  }

  markTouched(): void {
    this.onTouched();
  }
}

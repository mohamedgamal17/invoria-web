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

import type { PurchaseOrderSupplierRef } from '../../models/purchase-order.entity';
import type { Supplier } from '../../../suppliers/models/supplier.entity';
import { supplierSearchListRequest } from '../../../suppliers/models/list-supplier.request';
import { SuppliersApiService } from '../../../suppliers/services/suppliers-api.service';

@Component({
  selector: 'app-supplier-id-control',
  standalone: true,
  imports: [CommonModule, FormsModule, AutoCompleteModule, ButtonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SupplierIdControlComponent),
      multi: true
    }
  ],
  templateUrl: './supplier-id-control.component.html'
})
export class SupplierIdControlComponent implements ControlValueAccessor {
  private readonly suppliersApi = inject(SuppliersApiService);

  /** When editing, pass loaded supplier so the chip shows name before search. */
  readonly resolvedSupplier = input<PurchaseOrderSupplierRef | null>(null);
  readonly saving = input(false);

  readonly selectedSupplier = signal<Supplier | null>(null);
  readonly suggestions = signal<Supplier[]>([]);

  private currentId = '';
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};
  private disabledFromCva = false;

  constructor() {
    effect(() => {
      const ref = this.resolvedSupplier();
      if (!this.currentId || !ref || ref.id !== this.currentId) {
        return;
      }
      this.selectedSupplier.set({ id: ref.id, name: ref.name });
    });
  }

  isControlDisabled(): boolean {
    return this.disabledFromCva || this.saving();
  }

  writeValue(value: string | null): void {
    this.currentId = (value ?? '').trim();
    if (!this.currentId) {
      this.selectedSupplier.set(null);
      return;
    }
    const ref = this.resolvedSupplier();
    if (ref?.id === this.currentId) {
      this.selectedSupplier.set({ id: ref.id, name: ref.name });
    } else {
      this.selectedSupplier.set({ id: this.currentId, name: this.currentId });
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
    this.suppliersApi.searchSuppliers(supplierSearchListRequest, event.query).subscribe({
      next: (rows) => this.suggestions.set(rows),
      error: () => this.suggestions.set([])
    });
  }

  /** PrimeNG may not run `completeMethod` until the user types; load the first page on first focus/click. */
  onInputFocus(): void {
    this.onComplete({ query: '' });
  }

  onModelChange(supplier: Supplier | null): void {
    this.selectedSupplier.set(supplier);
    if (!supplier?.id) {
      if (this.currentId !== '') {
        this.currentId = '';
        this.onChange('');
      }
      return;
    }
    this.currentId = supplier.id;
    this.onChange(supplier.id);
    this.onTouched();
  }

  clearSelection(): void {
    this.currentId = '';
    this.selectedSupplier.set(null);
    this.suggestions.set([]);
    this.onChange('');
    this.onTouched();
  }

  markTouched(): void {
    this.onTouched();
  }
}

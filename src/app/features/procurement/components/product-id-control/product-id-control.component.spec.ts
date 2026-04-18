import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormArray, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';

import { ProductIdControlComponent } from './product-id-control.component';
import { ProductsApiService } from '../../../products/services/products-api.service';

@Component({
  standalone: true,
  template: `
    <form [formGroup]="form">
      <div formArrayName="items">
        @for (_ of items.controls; track $index) {
          <div [formGroupName]="$index">
            <app-product-id-control formControlName="productId" [rowIndex]="$index" />
          </div>
        }
      </div>
    </form>
  `,
  imports: [ReactiveFormsModule, ProductIdControlComponent]
})
class ProductPickerHostComponent {
  readonly form = new FormBuilder().nonNullable.group({
    items: new FormBuilder().array([
      new FormBuilder().nonNullable.group({
        productId: ['']
      })
    ])
  });

  get items(): FormArray {
    return this.form.controls.items;
  }
}

describe('ProductIdControlComponent', () => {
  beforeEach(() => {
    TestBed.resetTestingModule();
  });

  it('should sync CVA writeValue and clearSelection with onChange', () => {
    const searchProducts = vi.fn().mockReturnValue(of([]));
    TestBed.configureTestingModule({
      imports: [ProductIdControlComponent, NoopAnimationsModule],
      providers: [{ provide: ProductsApiService, useValue: { searchProducts } }]
    });
    const fixture = TestBed.createComponent(ProductIdControlComponent);
    const cmp = fixture.componentInstance;
    const onChange = vi.fn();
    cmp.registerOnChange(onChange);
    cmp.writeValue('prod_1');
    fixture.detectChanges();
    expect(cmp.selectedProduct()?.id).toBe('prod_1');
    cmp.clearSelection();
    expect(onChange).toHaveBeenLastCalledWith('');
  });

  it('should bind to FormControl inside FormArray', async () => {
    const searchProducts = vi.fn().mockReturnValue(of([]));
    await TestBed.configureTestingModule({
      imports: [ProductPickerHostComponent, NoopAnimationsModule],
      providers: [{ provide: ProductsApiService, useValue: { searchProducts } }]
    }).compileComponents();

    const fixture = TestBed.createComponent(ProductPickerHostComponent);
    const host = fixture.componentInstance;
    host.form.patchValue({ items: [{ productId: 'p1' }] });
    fixture.detectChanges();
    await fixture.whenStable();

    const picker = fixture.debugElement.query(By.css('app-product-id-control'))
      .componentInstance as ProductIdControlComponent;
    expect(picker.selectedProduct()?.id).toBe('p1');

    picker.clearSelection();
    expect(host.form.get('items')?.value).toEqual([{ productId: '' }]);
  });
});

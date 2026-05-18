import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormArray, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';

import { productSearchListRequest } from '../../../products/models/list-product.request';
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

@Component({
  standalone: true,
  template: `
    <form [formGroup]="form">
      <app-product-id-control formControlName="productId" [resolvedProduct]="resolved" />
    </form>
  `,
  imports: [ReactiveFormsModule, ProductIdControlComponent]
})
class ResolvedProductHostComponent {
  readonly form = new FormBuilder().nonNullable.group({ productId: [''] });
  resolved: { id: string; name: string } | null = null;
}

describe('ProductIdControlComponent', () => {
  beforeEach(() => {
    TestBed.resetTestingModule();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('applies cached first-page results immediately on second focus without API call', async () => {
    vi.useFakeTimers();
    const widget = {
      id: 'p1',
      name: 'Widget',
      price: 0,
      stock: { actualQuantity: 0, reservedQuantity: 0 },
      createdAt: ''
    };
    const searchProducts = vi.fn().mockReturnValue(of([widget]));
    TestBed.configureTestingModule({
      imports: [ProductIdControlComponent, NoopAnimationsModule],
      providers: [{ provide: ProductsApiService, useValue: { searchProducts } }]
    });
    const fixture = TestBed.createComponent(ProductIdControlComponent);
    const cmp = fixture.componentInstance;

    cmp.onInputFocus();
    await vi.advanceTimersByTimeAsync(300);
    expect(searchProducts).toHaveBeenCalledTimes(1);
    expect(cmp.suggestions()).toEqual([widget]);

    cmp.onInputFocus();
    expect(searchProducts).toHaveBeenCalledTimes(1);
    expect(cmp.searching()).toBe(false);
    expect(cmp.suggestions()).toEqual([widget]);
  });

  it('reuses cached products when the same query is searched again', async () => {
    vi.useFakeTimers();
    const widget = {
      id: 'p1',
      name: 'Widget',
      price: 0,
      stock: { actualQuantity: 0, reservedQuantity: 0 },
      createdAt: ''
    };
    const searchProducts = vi.fn().mockImplementation((_, query: string) =>
      of(query === 'ab' ? [widget] : [])
    );
    TestBed.configureTestingModule({
      imports: [ProductIdControlComponent, NoopAnimationsModule],
      providers: [{ provide: ProductsApiService, useValue: { searchProducts } }]
    });
    const fixture = TestBed.createComponent(ProductIdControlComponent);
    const cmp = fixture.componentInstance;

    cmp.onComplete({ query: 'ab' });
    await vi.advanceTimersByTimeAsync(300);
    expect(searchProducts).toHaveBeenCalledTimes(1);
    expect(cmp.suggestions()).toEqual([widget]);

    cmp.onComplete({ query: 'xy' });
    await vi.advanceTimersByTimeAsync(300);
    expect(searchProducts).toHaveBeenCalledTimes(2);

    cmp.onComplete({ query: 'ab' });
    await vi.advanceTimersByTimeAsync(300);
    expect(searchProducts).toHaveBeenCalledTimes(2);
    expect(cmp.suggestions()).toEqual([widget]);
  });

  it('debounces searchProducts and passes last distinct query', async () => {
    vi.useFakeTimers();
    const searchProducts = vi.fn().mockReturnValue(of([]));
    TestBed.configureTestingModule({
      imports: [ProductIdControlComponent, NoopAnimationsModule],
      providers: [{ provide: ProductsApiService, useValue: { searchProducts } }]
    });
    const fixture = TestBed.createComponent(ProductIdControlComponent);
    const cmp = fixture.componentInstance;

    cmp.onComplete({ query: 'a' });
    cmp.onComplete({ query: 'ab' });
    expect(searchProducts).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(300);
    expect(searchProducts).toHaveBeenCalledTimes(1);
    expect(searchProducts).toHaveBeenCalledWith(productSearchListRequest, 'ab');
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

  it('should show resolved product name when resolvedProduct matches control value', async () => {
    const searchProducts = vi.fn().mockReturnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [ResolvedProductHostComponent, NoopAnimationsModule],
      providers: [{ provide: ProductsApiService, useValue: { searchProducts } }]
    }).compileComponents();

    const fixture = TestBed.createComponent(ResolvedProductHostComponent);
    const host = fixture.componentInstance;
    host.resolved = { id: 'prod_1', name: 'Acme Widget' };
    host.form.patchValue({ productId: 'prod_1' });
    fixture.detectChanges();
    await fixture.whenStable();

    const picker = fixture.debugElement.query(By.css('app-product-id-control'))
      .componentInstance as ProductIdControlComponent;
    expect(picker.selectedProduct()?.name).toBe('Acme Widget');
    expect(picker.selectedProduct()?.name).not.toBe('prod_1');
  });
});

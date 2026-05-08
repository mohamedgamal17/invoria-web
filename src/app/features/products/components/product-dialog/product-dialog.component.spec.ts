import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { ProductDialogComponent } from './product-dialog.component';
import type { Product } from '../../models/product.entity';

describe('ProductDialogComponent', () => {
  let component: ProductDialogComponent;
  let fixture: ComponentFixture<ProductDialogComponent>;

  const mockProduct: Product = {
    id: 'prd_1',
    name: 'Product A',
    price: 50,
    stock: {
      actualQuantity: 10,
      reservedQuantity: 2
    },
    createdAt: new Date().toISOString(),
    createdBy: 'system',
    lastModifiedAt: new Date().toISOString(),
    lastModifiedBy: 'system'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductDialogComponent, NoopAnimationsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductDialogComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('mode', 'create');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize empty form in create mode', () => {
    expect(component.form.getRawValue()).toEqual({
      name: '',
      price: 0
    });
  });

  it('should prefill form when product input changes', () => {
    fixture.componentRef.setInput('product', mockProduct);
    fixture.detectChanges();

    expect(component.form.getRawValue()).toEqual({
      name: mockProduct.name,
      price: mockProduct.price
    });
  });

  it('should block submit and mark controls touched when form is invalid', () => {
    const saveSpy = vi.spyOn(component.save, 'emit');
    component.form.setValue({ name: '', price: 0 });

    component.submit();

    expect(saveSpy).not.toHaveBeenCalled();
    expect(component.form.controls.name.touched).toBe(true);
    expect(component.form.controls.price.touched).toBe(true);
  });

  it('should emit payload on valid submit', () => {
    const saveSpy = vi.spyOn(component.save, 'emit');
    component.form.setValue({
      name: '  Product X  ',
      price: 77.5
    });

    component.submit();

    expect(saveSpy).toHaveBeenCalledWith({
      name: '  Product X  ',
      price: 77.5
    });
  });

  it('should emit hide on dialog hide callback', () => {
    const hideSpy = vi.spyOn(component.hide, 'emit');

    component.onHide();

    expect(hideSpy).toHaveBeenCalled();
  });
});

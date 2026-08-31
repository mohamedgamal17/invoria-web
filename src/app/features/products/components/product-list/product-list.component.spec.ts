import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

import { ProductListComponent } from './product-list.component';
import type { Product } from '../../models/product.entity';

describe('ProductListComponent', () => {
  let component: ProductListComponent;
  let fixture: ComponentFixture<ProductListComponent>;

  const mockProduct: Product = {
    id: 'prd_1',
    name: 'Product A',
    price: 100,
    stock: {
      actualQuantity: 15,
      reservedQuantity: 4
    },
    createdAt: new Date().toISOString(),
    createdBy: 'system',
    lastModifiedAt: new Date().toISOString(),
    lastModifiedBy: 'system'
  };

  const setRequiredInputs = (): void => {
    fixture.componentRef.setInput('products', [mockProduct]);
    fixture.componentRef.setInput('totalRecords', 1);
    fixture.componentRef.setInput('first', 0);
    fixture.componentRef.setInput('pageSize', 25);
    fixture.componentRef.setInput('isListLoading', false);
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductListComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductListComponent);
    component = fixture.componentInstance;
    setRequiredInputs();
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit viewProduct via output', () => {
    const viewSpy = vi.spyOn(component.viewProduct, 'emit');
    component.viewProduct.emit(mockProduct);
    expect(viewSpy).toHaveBeenCalledWith(mockProduct);
  });

  it('should emit pageChange via output', () => {
    const pageChangeSpy = vi.spyOn(component.pageChange, 'emit');
    const desktopEvent = { first: 10, rows: 10 };
    const mobileEvent = { first: 5, rows: 5 };

    component.pageChange.emit(desktopEvent as any);
    component.pageChange.emit(mobileEvent as any);

    expect(pageChangeSpy).toHaveBeenCalledWith(desktopEvent);
    expect(pageChangeSpy).toHaveBeenCalledWith(mobileEvent);
  });

  it('should compute skeletonRows based on pageSize input', () => {
    fixture.componentRef.setInput('pageSize', 5);
    fixture.detectChanges();
    expect(component.skeletonRows.length).toBe(5);

    fixture.componentRef.setInput('pageSize', 20);
    fixture.detectChanges();
    expect(component.skeletonRows.length).toBe(20);
  });

  it('should emit clearFilters via output', () => {
    const clearSpy = vi.spyOn(component.clearFilters, 'emit');
    component.clearFilters.emit();
    expect(clearSpy).toHaveBeenCalled();
  });

  it('should compute stock severity and label correctly', () => {
    expect(component.getStockSeverity(mockProduct)).toBe('success');
    expect(component.stockStatusLabel(mockProduct)).toBe('In stock');
    expect(component.formatQuantitySummary(15, 4)).toBe('Actual 15, Reserved 4, Available 11');

    const outOfStock = { ...mockProduct, stock: { actualQuantity: 0, reservedQuantity: 0 } };
    expect(component.getStockSeverity(outOfStock)).toBe('danger');
    expect(component.stockStatusLabel(outOfStock)).toBe('Out of stock');
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
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
      imports: [ProductListComponent, NoopAnimationsModule]
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

  it('should render enhanced actual/reserved quantity view in mobile and desktop', () => {
    const quantityBadges = fixture.nativeElement.querySelectorAll('[aria-label="Actual 15 / Reserved 4"]');

    expect(quantityBadges.length).toBe(2);
    expect(fixture.nativeElement.textContent).toContain('Act');
    expect(fixture.nativeElement.textContent).toContain('Res');
  });

  it('should emit viewProduct from row action buttons', () => {
    const viewSpy = vi.spyOn(component.viewProduct, 'emit');

    const buttons = fixture.debugElement.queryAll(By.css('p-button'));
    const viewButton = buttons.find((btn) => btn.nativeElement.innerHTML.includes('pi-arrow-right'));

    expect(viewButton).toBeTruthy();

    viewButton?.triggerEventHandler('onClick', {});

    expect(viewSpy).toHaveBeenCalledWith(mockProduct);
  });

  it('should emit pageChange from desktop table and mobile paginator', () => {
    const pageChangeSpy = vi.spyOn(component.pageChange, 'emit');
    const desktopEvent = { first: 10, rows: 10 };
    const mobileEvent = { first: 5, rows: 5 };

    const table = fixture.debugElement.query(By.css('p-table'));
    const paginator = fixture.debugElement.query(By.css('p-paginator'));

    table.triggerEventHandler('onPage', desktopEvent);
    paginator.triggerEventHandler('onPageChange', mobileEvent);

    expect(pageChangeSpy).toHaveBeenCalledWith(desktopEvent);
    expect(pageChangeSpy).toHaveBeenCalledWith(mobileEvent);
  });

  it('should show skeleton while loading and empty state when not loading with no products', () => {
    fixture.componentRef.setInput('isListLoading', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('p-skeleton').length).toBeGreaterThan(0);

    fixture.componentRef.setInput('isListLoading', false);
    fixture.componentRef.setInput('products', []);
    fixture.componentRef.setInput('totalRecords', 0);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('No products found');
  });

  it('should compute skeletonRows based on pageSize input', () => {
    fixture.componentRef.setInput('pageSize', 5);
    fixture.detectChanges();
    expect(component.skeletonRows.length).toBe(5);

    fixture.componentRef.setInput('pageSize', 20);
    fixture.detectChanges();
    expect(component.skeletonRows.length).toBe(20);
  });

  it('should emit clearFilters when Clear filters is clicked in empty state', () => {
    fixture.componentRef.setInput('isListLoading', false);
    fixture.componentRef.setInput('products', []);
    fixture.componentRef.setInput('totalRecords', 0);
    fixture.detectChanges();

    const clearSpy = vi.spyOn(component.clearFilters, 'emit');
    const clearButton = fixture.debugElement
      .queryAll(By.css('p-button'))
      .find((btn) => btn.nativeElement.textContent?.includes('Clear filters'));

    expect(clearButton).toBeTruthy();
    clearButton?.triggerEventHandler('onClick', {});

    expect(clearSpy).toHaveBeenCalled();
  });
});

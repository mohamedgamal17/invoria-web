import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { productSearchListRequest } from '../../../products/models/list-product.request';
import { ProductIdControlComponent } from './product-id-control.component';
import { ProductsApiService } from '../../../products/services/products-api.service';

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

  it('should show resolved product when resolvedProduct input matches control value', () => {
    const searchProducts = vi.fn().mockReturnValue(of([]));
    TestBed.configureTestingModule({
      imports: [ProductIdControlComponent, NoopAnimationsModule],
      providers: [{ provide: ProductsApiService, useValue: { searchProducts } }]
    });
    const fixture = TestBed.createComponent(ProductIdControlComponent);
    const cmp = fixture.componentInstance;
    fixture.componentRef.setInput('resolvedProduct', { id: 'prod_1', name: 'Acme Widget' } as any);
    cmp.writeValue('prod_1');
    fixture.detectChanges();
    expect(cmp.selectedProduct()?.name).toBe('Acme Widget');
  });

  it('should propagate writeValue to selectedProduct without host DOM', () => {
    const searchProducts = vi.fn().mockReturnValue(of([]));
    TestBed.configureTestingModule({
      imports: [ProductIdControlComponent, NoopAnimationsModule],
      providers: [{ provide: ProductsApiService, useValue: { searchProducts } }]
    });
    const fixture = TestBed.createComponent(ProductIdControlComponent);
    const cmp = fixture.componentInstance;
    cmp.writeValue('p1');
    fixture.detectChanges();
    expect(cmp.selectedProduct()?.id).toBe('p1');
    const onChange = vi.fn();
    cmp.registerOnChange(onChange);
    cmp.clearSelection();
    expect(onChange).toHaveBeenLastCalledWith('');
    expect(cmp.selectedProduct()).toBeNull();
  });
});

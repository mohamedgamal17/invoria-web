import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router, provideRouter } from '@angular/router';
import { Store, provideStore, provideState } from '@ngrx/store';

import { ProductsPageComponent } from './products-page.component';
import type { Product } from '../../models/product.entity';
import {
  PRODUCTS_LIST_FEATURE_KEY,
  PRODUCTS_LIST_INITIAL_STATE,
  productsListReducer,
} from '../../store/products-list/products-list.reducer';
import { PRODUCTS_LIST_ACTIONS } from '../../store/products-list/products-list.actions';

describe('ProductsPageComponent', () => {
  let component: ProductsPageComponent;
  let fixture: ComponentFixture<ProductsPageComponent>;
  let store: Store;
  let router: Router;
  let scrollToSpy: { mockClear: () => void };

  const mockProduct: Product = {
    id: 'prd_1',
    name: 'Alpha Widget',
    price: 100,
    stock: { actualQuantity: 10, reservedQuantity: 2 },
    createdAt: '2026-01-01T00:00:00.000Z',
  };

  async function createFixture(
    query = { pageIndex: 0, pageSize: 25, nameFilter: '' },
  ): Promise<void> {
    TestBed.resetTestingModule();
    scrollToSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});

    await TestBed.configureTestingModule({
      imports: [ProductsPageComponent, NoopAnimationsModule],
      providers: [
        provideStore({}),
        provideState(PRODUCTS_LIST_FEATURE_KEY, productsListReducer),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { parent: { snapshot: { url: [] } } },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductsPageComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(Store);
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    store.dispatch(PRODUCTS_LIST_ACTIONS.setQueryFromUrl(query));
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await createFixture();
  });

  it('should create with idle list state', () => {
    expect(component).toBeTruthy();
    expect(component.products()).toEqual([]);
    expect(component.paging().totalCount).toBe(0);
    expect(component.listLoading()).toBe(false);
  });

  it('should expose products loaded through the store selectors', () => {
    store.dispatch(
      PRODUCTS_LIST_ACTIONS.loadProductsSuccess({
        products: [mockProduct],
        info: { length: 25, skip: 0, totalCount: 1 },
      }),
    );
    fixture.detectChanges();

    expect(component.products()).toEqual([mockProduct]);
    expect(component.paging().totalCount).toBe(1);
    expect(component.first()).toBe(0);
  });

  it('goToCreate should navigate to new relative to the parent route', () => {
    const route = TestBed.inject(ActivatedRoute);
    component.goToCreate();
    expect(router.navigate).toHaveBeenCalledWith(['new'], { relativeTo: route.parent });
  });

  it('goToDetails should navigate to product id', () => {
    const route = TestBed.inject(ActivatedRoute);
    component.goToDetails(mockProduct);
    expect(router.navigate).toHaveBeenCalledWith([mockProduct.id], {
      relativeTo: route.parent,
    });
  });

  it('onPageChange should sync page/pageSize to route and scroll on manual page change', () => {
    const route = TestBed.inject(ActivatedRoute);

    component.onPageChange({ first: 100, rows: 25, page: 4 });

    expect(router.navigate).toHaveBeenCalledWith([], {
      relativeTo: route,
      queryParams: { page: 5, pageSize: 25 },
      queryParamsHandling: 'merge',
    });
    expect(scrollToSpy).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });

  it('onPageChange should scroll only when the page index really changes', () => {
    scrollToSpy.mockClear();
    component.onPageChange({ first: 0, rows: 50, page: 0 });
    expect(scrollToSpy).not.toHaveBeenCalled();
  });

  it('onFiltersChange should sync name to route and reset page', () => {
    const route = TestBed.inject(ActivatedRoute);

    component.onFiltersChange({ name: 'widget' });

    expect(router.navigate).toHaveBeenCalledWith([], {
      relativeTo: route,
      queryParams: { name: 'widget', page: 1 },
      queryParamsHandling: 'merge',
    });
  });

  it('onFiltersChange should no-op when name unchanged', () => {
    vi.mocked(router.navigate).mockClear();

    component.onFiltersChange({ name: '' });

    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('onClearFilters should clear name and reset page', async () => {
    await createFixture({ pageIndex: 0, pageSize: 25, nameFilter: 'widget' });
    const route = TestBed.inject(ActivatedRoute);
    expect(component.nameFilter()).toBe('widget');
    vi.mocked(router.navigate).mockClear();

    component.onClearFilters();

    expect(router.navigate).toHaveBeenCalledWith([], {
      relativeTo: route,
      queryParams: { name: null, page: 1 },
      queryParamsHandling: 'merge',
    });
  });

  it('onClearFilters should no-op when name filter already empty', () => {
    vi.mocked(router.navigate).mockClear();

    component.onClearFilters();

    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should sync name filter from the store (URL effect applies the state)', async () => {
    await createFixture({ pageIndex: 0, pageSize: 25, nameFilter: 'widget' });
    expect(component.nameFilter()).toBe('widget');
    expect(PRODUCTS_LIST_INITIAL_STATE.pageSize).toBe(25);
  });
});

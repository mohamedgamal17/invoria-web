import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router, provideRouter } from '@angular/router';
import { Store, provideStore, provideState } from '@ngrx/store';
import { MessageService } from 'primeng/api';

import { PurchaseListPageComponent } from './purchase-list-page.component';
import type { PurchaseOrder } from '../../models/purchase-order.entity';
import { PurchaseState } from '../../enums/purchase-state.enum';
import {
  PURCHASE_ORDERS_LIST_FEATURE_KEY,
  purchaseOrdersListReducer,
} from '../../store/purchase-orders-list/purchase-orders-list.reducer';
import { PURCHASE_ORDERS_LIST_ACTIONS } from '../../store/purchase-orders-list/purchase-orders-list.actions';

describe('PurchaseListPageComponent', () => {
  let component: PurchaseListPageComponent;
  let fixture: ComponentFixture<PurchaseListPageComponent>;
  let store: Store;
  let router: Router;
  let scrollToSpy: { mockClear: () => void };

  const mockPo: PurchaseOrder = {
    id: 'po_1',
    createdAt: '2026-01-01T00:00:00.000Z',
    purchaseNumber: 'PO-001',
    supplierId: 'sup_1',
    supplier: { id: 'sup_1', name: 'Acme Supplies' },
    state: PurchaseState.Draft,
    subTotal: 100,
    totalAmount: 114,
  };

  async function createFixture(
    query = { pageIndex: 0, pageSize: 25, numberFilter: '', statusFilter: null as number | null },
  ): Promise<void> {
    TestBed.resetTestingModule();
    scrollToSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});

    await TestBed.configureTestingModule({
      imports: [PurchaseListPageComponent, NoopAnimationsModule],
      providers: [
        MessageService,
        provideStore({}),
        provideState(PURCHASE_ORDERS_LIST_FEATURE_KEY, purchaseOrdersListReducer),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { url: [] } },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PurchaseListPageComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(Store);
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    store.dispatch(PURCHASE_ORDERS_LIST_ACTIONS.setQueryFromUrl(query));
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await createFixture();
  });

  it('should create with idle list state', () => {
    expect(component).toBeTruthy();
    expect(component.purchaseOrders()).toEqual([]);
    expect(component.paging().totalCount).toBe(0);
    expect(component.listLoading()).toBe(false);
    expect(component.first()).toBe(0);
  });

  it('should expose purchase orders loaded through the store selectors', () => {
    store.dispatch(
      PURCHASE_ORDERS_LIST_ACTIONS.loadPurchaseOrdersSuccess({
        purchaseOrders: [mockPo],
        info: { length: 25, skip: 0, totalCount: 1 },
      }),
    );
    fixture.detectChanges();

    expect(component.purchaseOrders()).toEqual([mockPo]);
    expect(component.paging().totalCount).toBe(1);
    expect(component.first()).toBe(0);
  });

  it('should update query params on page change and scroll to top', () => {
    const route = TestBed.inject(ActivatedRoute);

    component.onPageChange({ first: 25, rows: 25 });

    expect(router.navigate).toHaveBeenCalledWith(
      [],
      expect.objectContaining({
        relativeTo: route,
        queryParams: { page: 2, pageSize: 25 },
        queryParamsHandling: 'merge',
      }),
    );
    expect(scrollToSpy).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });

  it('should scroll only when the page index really changes', () => {
    scrollToSpy.mockClear();
    component.onPageChange({ first: 0, rows: 50 });
    expect(scrollToSpy).not.toHaveBeenCalled();
  });

  it('should update query params on filters change and reset page', () => {
    const route = TestBed.inject(ActivatedRoute);

    component.onFiltersChange({ purchaseNumber: 'PO-100', status: PurchaseState.Draft });

    expect(router.navigate).toHaveBeenCalledWith(
      [],
      expect.objectContaining({
        relativeTo: route,
        queryParams: {
          page: 1,
          number: 'PO-100',
          status: String(PurchaseState.Draft),
        },
        queryParamsHandling: 'merge',
      }),
    );
  });

  it('should skip filters navigation when the filters are unchanged', () => {
    vi.mocked(router.navigate).mockClear();
    store.dispatch(
      PURCHASE_ORDERS_LIST_ACTIONS.setQueryFromUrl({
        pageIndex: 0,
        pageSize: 25,
        numberFilter: 'PO-100',
        statusFilter: PurchaseState.Draft,
      }),
    );

    component.onFiltersChange({ purchaseNumber: 'PO-100', status: PurchaseState.Draft });

    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should clear filter query params on clear filters', () => {
    const route = TestBed.inject(ActivatedRoute);
    store.dispatch(
      PURCHASE_ORDERS_LIST_ACTIONS.setQueryFromUrl({
        pageIndex: 1,
        pageSize: 25,
        numberFilter: 'PO-1',
        statusFilter: PurchaseState.Submitted,
      }),
    );
    vi.mocked(router.navigate).mockClear();

    component.onClearFilters();

    expect(router.navigate).toHaveBeenCalledWith(
      [],
      expect.objectContaining({
        relativeTo: route,
        queryParams: { page: 1, number: null, status: null },
        queryParamsHandling: 'merge',
      }),
    );
  });

  it('should skip clear-filters navigation when no filter is active', () => {
    vi.mocked(router.navigate).mockClear();

    component.onClearFilters();

    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should navigate to purchase order detail on goToDetails', () => {
    const route = TestBed.inject(ActivatedRoute);
    component.goToDetails(mockPo);
    expect(router.navigate).toHaveBeenCalledWith([mockPo.id], { relativeTo: route });
  });

  it('should navigate to create form on goToCreate', () => {
    const route = TestBed.inject(ActivatedRoute);
    component.goToCreate();
    expect(router.navigate).toHaveBeenCalledWith(['new'], { relativeTo: route });
  });
});

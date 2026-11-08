import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router, provideRouter } from '@angular/router';
import { Store, provideStore, provideState } from '@ngrx/store';

import { OrdersPageComponent } from './orders-page.component';
import type { UiOrder } from '../../models/order-ui.model';
import { OrderStatus } from '../../models/order.entity';
import { PaymentStatus, PaymentType } from '../../models/order-payment.enums';
import {
  ORDERS_LIST_FEATURE_KEY,
  ORDERS_LIST_INITIAL_STATE,
  ordersListReducer,
} from '../../store/orders-list/orders-list.reducer';
import { ORDERS_LIST_ACTIONS } from '../../store/orders-list/orders-list.actions';

describe('OrdersPageComponent', () => {
  let component: OrdersPageComponent;
  let fixture: ComponentFixture<OrdersPageComponent>;
  let store: Store;
  let router: Router;
  let scrollToSpy: { mockClear: () => void };

  const mockOrder: UiOrder = {
    id: 'ord_1',
    createdAt: '2026-04-01T12:00:00.000Z',
    orderNumber: 'ORD-10001',
    customerName: 'Alice',
    netOfTotalOrderAmount: 21,
    returnsTotal: 0,
    status: OrderStatus.Pending,
    paymentType: PaymentType.Immediate,
    paymentStatus: PaymentStatus.Paid,
    orderDate: '2026-04-01T12:00:00.000Z',
    items: [{ id: 'line-1', productId: 'prd_1', productName: 'Widget', quantity: 2, price: 10.5 }],
    returnItems: [],
    orderAllocated: false,
  };

  type UrlQuery = {
    pageIndex: number;
    pageSize: number;
    orderNumberFilter: string;
    statusFilter: number | null;
    paymentStatusFilter: number | null;
    paymentTypeFilter: number | null;
  };

  async function createFixture(query: UrlQuery = {
    pageIndex: 0,
    pageSize: 25,
    orderNumberFilter: '',
    statusFilter: null,
    paymentStatusFilter: null,
    paymentTypeFilter: null,
  }): Promise<void> {
    TestBed.resetTestingModule();
    scrollToSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});

    await TestBed.configureTestingModule({
      imports: [OrdersPageComponent, NoopAnimationsModule],
      providers: [
        provideStore({}),
        provideState(ORDERS_LIST_FEATURE_KEY, ordersListReducer),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {},
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OrdersPageComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(Store);
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    store.dispatch(ORDERS_LIST_ACTIONS.setQueryFromUrl(query));
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await createFixture();
  });

  it('should create with idle list state', () => {
    expect(component).toBeTruthy();
    expect(component.orders()).toEqual([]);
    expect(component.paging().totalCount).toBe(0);
    expect(component.listLoading()).toBe(false);
  });

  it('should expose orders loaded through the store selectors', () => {
    store.dispatch(
      ORDERS_LIST_ACTIONS.loadOrdersSuccess({
        orders: [mockOrder],
        info: { length: 25, skip: 0, totalCount: 1 },
      }),
    );
    fixture.detectChanges();

    expect(component.orders()).toEqual([mockOrder]);
    expect(component.paging().totalCount).toBe(1);
    expect(component.first()).toBe(0);
  });

  it('goToCreatePage should navigate to new relative to the list route', () => {
    const route = TestBed.inject(ActivatedRoute);
    component.goToCreatePage();
    expect(router.navigate).toHaveBeenCalledWith(['new'], { relativeTo: route });
  });

  it('goToDetails should navigate to order id', () => {
    const route = TestBed.inject(ActivatedRoute);
    component.goToDetails(mockOrder);
    expect(router.navigate).toHaveBeenCalledWith([mockOrder.id], { relativeTo: route });
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

  it('onFiltersChange should sync all filters to route (under `q`) and reset page', () => {
    const route = TestBed.inject(ActivatedRoute);

    component.onFiltersChange({
      orderNumber: 'ORD-10001',
      status: OrderStatus.Pending,
      paymentStatus: PaymentStatus.Paid,
      paymentType: PaymentType.Immediate,
    });

    expect(router.navigate).toHaveBeenCalledWith([], {
      relativeTo: route,
      queryParams: {
        q: 'ORD-10001',
        status: String(OrderStatus.Pending),
        paymentStatus: String(PaymentStatus.Paid),
        paymentType: String(PaymentType.Immediate),
        page: 1,
      },
      queryParamsHandling: 'merge',
    });
  });

  it('onFiltersChange should no-op when the filters are unchanged', () => {
    vi.mocked(router.navigate).mockClear();

    component.onFiltersChange({
      orderNumber: '',
      status: null,
      paymentStatus: null,
      paymentType: null,
    });

    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('onClearFilters should clear all filters and reset page', async () => {
    await createFixture({
      pageIndex: 0,
      pageSize: 25,
      orderNumberFilter: 'ORD-1',
      statusFilter: OrderStatus.Pending,
      paymentStatusFilter: null,
      paymentTypeFilter: null,
    });
    const route = TestBed.inject(ActivatedRoute);
    expect(component.orderNumberFilter()).toBe('ORD-1');
    vi.mocked(router.navigate).mockClear();

    component.onClearFilters();

    expect(router.navigate).toHaveBeenCalledWith([], {
      relativeTo: route,
      queryParams: { q: null, status: null, paymentStatus: null, paymentType: null, page: 1 },
      queryParamsHandling: 'merge',
    });
  });

  it('onClearFilters should no-op when the filters are already clear', () => {
    vi.mocked(router.navigate).mockClear();

    component.onClearFilters();

    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should read filters from the store (the URL effect applies the state)', async () => {
    await createFixture({
      pageIndex: 0,
      pageSize: 25,
      orderNumberFilter: 'ORD-1',
      statusFilter: OrderStatus.Processing,
      paymentStatusFilter: PaymentStatus.Paid,
      paymentTypeFilter: PaymentType.Immediate,
    });
    expect(component.orderNumberFilter()).toBe('ORD-1');
    expect(component.statusFilter()).toBe(OrderStatus.Processing);
    expect(component.paymentStatusFilter()).toBe(PaymentStatus.Paid);
    expect(component.paymentTypeFilter()).toBe(PaymentType.Immediate);
    expect(ORDERS_LIST_INITIAL_STATE.pageSize).toBe(25);
  });
});

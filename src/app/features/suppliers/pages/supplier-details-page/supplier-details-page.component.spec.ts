import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import type { NavigationEnd, RoutesRecognized } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';

import { provideState, provideStore, Store } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import {
  type SerializedRouterStateSnapshot,
  routerNavigationAction,
  routerNavigatedAction,
  routerReducer,
} from '@ngrx/router-store';
import { MessageService } from 'primeng/api';

import { SupplierDetailsPageComponent } from './supplier-details-page.component';
import { SuppliersApiService } from '../../services/suppliers-api.service';
import { PurchaseOrdersApiService } from '../../../procurement/services/purchase-orders-api.service';
import {
  SUPPLIER_DETAILS_FEATURE_KEY,
  supplierDetailsReducer,
  SupplierDetailsTab,
} from '../../store/supplier-details/supplier-details.reducer';
import { SupplierDetailsEffects } from '../../store/supplier-details/supplier-details.effects';
import {
  SUPPLIER_PURCHASE_ORDERS_FEATURE_KEY,
  supplierPurchaseOrdersReducer,
} from '../../store/supplier-details-purchase-orders/supplier-details-purchase-orders.reducer';
import { SupplierPurchaseOrdersEffects } from '../../store/supplier-details-purchase-orders/supplier-details-purchase-orders.effects';
import { SupplierDetailsUrlEffects } from '../../store/supplier-details-url/supplier-details-url.effects';
import { AppErrorEffects } from '../../../../shared/store/app-error.effects';
import type { Supplier } from '../../models/supplier.entity';

function createActivatedRouteMock(initialParams: Record<string, string> = { id: 'sup_1' }) {
  const paramMap$: BehaviorSubject<ReturnType<typeof convertToParamMap>> = new BehaviorSubject(
    convertToParamMap(initialParams),
  );
  return {
    paramMap$,
    route: {
      paramMap: paramMap$.asObservable(),
      get snapshot() {
        return { paramMap: paramMap$.value };
      },
    },
  };
}

/**
 * Simulates the router-store actions the real router would emit for one
 * navigation: `ROUTER_NAVIGATION` (updates the store router state) plus
 * `ROUTER_NAVIGATED` (triggers the URL-sync effect).
 */
function navigateUrl(query: Record<string, string>, id = 'sup_1'): void {
  const store = TestBed.inject(Store);
  const routerState = fakeRouterState(query, id);
  const url = `/suppliers/${id}`;
  store.dispatch(
    routerNavigationAction({
      payload: {
        routerState: routerState,
        event: { id: 1, url, urlAfterRedirects: url } as unknown as RoutesRecognized,
      },
    }),
  );
  store.dispatch(
    routerNavigatedAction({
      payload: {
        routerState: routerState,
        event: { id: 1, url, urlAfterRedirects: url } as unknown as NavigationEnd,
      },
    }),
  );
}

/**
 * Minimal router-store snapshot (the shape the MinimalRouterStateSerializer
 * produces): `root.queryParams` carries the query, the leaf route carries
 * the `id` param — `selectCurrentRoute` walks `root.firstChild`.
 */
function fakeRouterState(
  queryParams: Record<string, string>,
  id: string,
): SerializedRouterStateSnapshot {
  const leafRoute = {
    params: { id },
    data: {},
    url: [],
    outlet: 'primary',
    title: undefined,
    routeConfig: null,
    queryParams,
    fragment: null,
    firstChild: undefined,
    children: [],
  };
  return {
    url: `/suppliers/${id}`,
    root: {
      params: {},
      data: {},
      url: [],
      outlet: 'primary',
      title: undefined,
      routeConfig: null,
      queryParams,
      fragment: null,
      firstChild: leafRoute,
      children: [leafRoute],
    },
  } as unknown as SerializedRouterStateSnapshot;
}

function makeTestBed(
  overrides: {
    getSupplier?: ReturnType<typeof vi.fn>;
    listPurchaseOrders?: ReturnType<typeof vi.fn>;
    initialParams?: Record<string, string>;
  } = {},
) {
  const getSupplier =
    overrides.getSupplier ??
    vi.fn().mockReturnValue(
      of({
        isSuccess: true as const,
        result: {
          id: 'sup_1',
          name: 'Acme Supplies',
          createdAt: '2026-01-01T00:00:00.000Z',
        } satisfies Supplier,
      }),
    );

  const listPurchaseOrders =
    overrides.listPurchaseOrders ??
    vi.fn().mockReturnValue(
      of({
        isSuccess: true as const,
        result: { data: [], info: { length: 0, skip: 0, totalCount: 0 } },
      }),
    );

  const { route, paramMap$ } = createActivatedRouteMock(overrides.initialParams ?? { id: 'sup_1' });

  const providers = [
    provideStore({}),
    provideState('router', routerReducer),
    provideState(SUPPLIER_DETAILS_FEATURE_KEY, supplierDetailsReducer),
    provideState(SUPPLIER_PURCHASE_ORDERS_FEATURE_KEY, supplierPurchaseOrdersReducer),
    provideEffects(
      SupplierDetailsEffects,
      SupplierPurchaseOrdersEffects,
      SupplierDetailsUrlEffects,
      AppErrorEffects,
    ),
    MessageService,
    { provide: SuppliersApiService, useValue: { getSupplier } },
    { provide: PurchaseOrdersApiService, useValue: { listPurchaseOrders } },
    { provide: ActivatedRoute, useValue: route },
    { provide: Router, useValue: { navigate: vi.fn().mockResolvedValue(true) } },
  ];

  return { getSupplier, listPurchaseOrders, paramMap$, providers };
}

interface FixtureBundle {
  fixture: ComponentFixture<SupplierDetailsPageComponent>;
  component: SupplierDetailsPageComponent;
  paramMap$: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
}

async function bootstrap(overrides: Parameters<typeof makeTestBed>[0]): Promise<FixtureBundle> {
  TestBed.resetTestingModule();
  const { providers, paramMap$ } = makeTestBed(overrides);
  await TestBed.configureTestingModule({
    imports: [SupplierDetailsPageComponent, NoopAnimationsModule],
    providers,
  }).compileComponents();

  const fixture = TestBed.createComponent(SupplierDetailsPageComponent);
  const component = fixture.componentInstance;
  fixture.detectChanges();
  return { fixture, component, paramMap$ };
}

describe('SupplierDetailsPageComponent (NgRx stores)', () => {
  beforeEach(() => {
    if (typeof globalThis.ResizeObserver === 'undefined') {
      globalThis.ResizeObserver = class {
        observe(): void {}
        unobserve(): void {}
        disconnect(): void {}
      };
    }
  });

  it('loads the supplier through the details store on page mount', async () => {
    const getSupplier = createSupplierStub();
    const bundle = await bootstrap({ getSupplier, listPurchaseOrders: createPurchaseOrdersStub() });

    expect(getSupplier).toHaveBeenCalledWith('sup_1');
    expect(bundle.component.supplier()?.id).toBe('sup_1');
    expect(bundle.component.loading()).toBe(false);
  });

  it('does not fetch purchase orders until the Purchase Orders tab is opened', async () => {
    const listPurchaseOrders = createPurchaseOrdersStub();
    const { component, fixture } = await bootstrap({ listPurchaseOrders });

    expect(listPurchaseOrders).not.toHaveBeenCalled();

    component.onTabChange(SupplierDetailsTab.PurchaseOrders);
    fixture.detectChanges();

    expect(listPurchaseOrders).toHaveBeenCalledTimes(1);
    const request = listPurchaseOrders.mock.calls[0][0];
    expect(request.SupplierId).toBe('sup_1');
    expect(request.Skip).toBe(0);
    expect(request.Length).toBe(25);
    expect(request.IncludePurchaseItems).toBe(false);
    expect(request.IncludeSupplier).toBe(true);
    expect(component.activeTab()).toBe(SupplierDetailsTab.PurchaseOrders);
  });

  it('includes the status filter in the list request after a filter change', async () => {
    const listPurchaseOrders = createPurchaseOrdersStub();
    const { component, fixture } = await bootstrap({ listPurchaseOrders });

    component.onPurchaseOrdersFiltersChange({ purchaseNumber: '', status: 2 });
    component.onTabChange(SupplierDetailsTab.PurchaseOrders);
    fixture.detectChanges();

    const lastRequest = listPurchaseOrders.mock.calls[listPurchaseOrders.mock.calls.length - 1][0];
    expect(lastRequest.Status).toBe(2);
    expect(lastRequest.SupplierId).toBe('sup_1');
  });

  it('applies the `tab=purchase-orders` query into the store after the supplier is loaded', async () => {
    const listPurchaseOrders = createPurchaseOrdersStub();
    const { component, fixture } = await bootstrap({ listPurchaseOrders });

    navigateUrl({ tab: 'purchase-orders' });
    fixture.detectChanges();

    expect(component.activeTab()).toBe(SupplierDetailsTab.PurchaseOrders);
    expect(listPurchaseOrders).toHaveBeenCalledTimes(1);
  });

  it('applies URL paging into the purchase orders state before any fetch', async () => {
    const listPurchaseOrders = createPurchaseOrdersStub();
    const { component, fixture } = await bootstrap({ listPurchaseOrders });

    // The URL adapter: paging observed from the query while the tab is still closed.
    navigateUrl({ page: '2', rows: '50' });
    fixture.detectChanges();
    expect(listPurchaseOrders).not.toHaveBeenCalled(); // tab gate keeps it idle

    // Opening the Purchase Orders tab reads the URL-backed paging values from state.
    component.onTabChange(SupplierDetailsTab.PurchaseOrders);
    fixture.detectChanges();

    expect(listPurchaseOrders).toHaveBeenCalledTimes(1);
    const request = listPurchaseOrders.mock.calls[0][0];
    expect(request.Skip).toBe(100);
    expect(request.Length).toBe(50);
  });

  it('ignores an unknown tab slug and keeps the default paging values', async () => {
    const listPurchaseOrders = createPurchaseOrdersStub();
    const { component, fixture } = await bootstrap({ listPurchaseOrders });

    navigateUrl({ tab: 'bogus', page: '-3', rows: '12345' });
    fixture.detectChanges();

    expect(component.activeTab()).toBe(SupplierDetailsTab.Profile);
    expect(listPurchaseOrders).not.toHaveBeenCalled();

    // With no URL params the state stays at its defaults: page 0 / rows 25.
    component.onTabChange(SupplierDetailsTab.PurchaseOrders);
    fixture.detectChanges();
    const request = listPurchaseOrders.mock.calls[0][0];
    expect(request.Skip).toBe(0);
    expect(request.Length).toBe(25);
  });

  it('writes tab/page/rows query params back on tab change', async () => {
    const { component } = await bootstrap({});
    const router = TestBed.inject(Router);

    component.onTabChange(SupplierDetailsTab.PurchaseOrders);

    expect(router.navigate).toHaveBeenCalledWith(
      [],
      expect.objectContaining({
        replaceUrl: true,
        queryParams: expect.objectContaining({ tab: 'purchase-orders' }),
      }),
    );
  });

  it('navigates back to the suppliers list', async () => {
    const { component } = await bootstrap({});
    const router = TestBed.inject(Router);

    component.backToList();

    expect(router.navigate).toHaveBeenCalledWith(['/suppliers']);
  });

  it('reloads the supplier when the :id param changes', async () => {
    const supplier = {
      id: 'sup_1',
      name: 'Acme Supplies',
      createdAt: '2026-01-01T00:00:00.000Z',
    } satisfies Supplier;
    const supplier2 = { ...supplier, id: 'sup_2', name: 'Beta Supply Co' } satisfies Supplier;
    const getSupplier = vi
      .fn()
      .mockImplementation((supplierId: string) =>
        of(
          supplierId === 'sup_1'
            ? { isSuccess: true as const, result: supplier }
            : { isSuccess: true as const, result: supplier2 },
        ),
      );

    const { paramMap$, component, fixture } = await bootstrap({ getSupplier });
    expect(component.supplier()?.id).toBe('sup_1');

    paramMap$.next(convertToParamMap({ id: 'sup_2' }));
    fixture.detectChanges();

    expect(getSupplier).toHaveBeenCalledWith('sup_2');
    expect(component.supplier()?.id).toBe('sup_2');
  });
});

describe('SupplierDetailsPageComponent error presentation', () => {
  beforeEach(() => {
    if (typeof globalThis.ResizeObserver === 'undefined') {
      globalThis.ResizeObserver = class {
        observe(): void {}
        unobserve(): void {}
        disconnect(): void {}
      };
    }
  });

  it('presents the load failure via the global error effect and keeps the inline error', async () => {
    const failedGetSupplier = vi.fn().mockReturnValue(
      of({
        isSuccess: false as const,
        error: { kind: 'api', title: 'Request failed', detail: 'Server error' },
      }),
    );
    const { providers } = makeTestBed({
      getSupplier: failedGetSupplier,
      initialParams: { id: 'sup_fail' },
    });

    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [SupplierDetailsPageComponent, NoopAnimationsModule],
      providers,
    }).compileComponents();

    const addSpy = vi.spyOn(TestBed.inject(MessageService), 'add');
    const fixture = TestBed.createComponent(SupplierDetailsPageComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    expect(addSpy).toHaveBeenCalled();
    expect(component.supplier()).toBeNull();
    expect(component.error()).toBeTruthy();
  });
});

/* ------------------------------------------------------------------ */
/* helpers                                                            */
/* ------------------------------------------------------------------ */

function createSupplierStub(): ReturnType<typeof vi.fn> {
  const supplier: Supplier = {
    id: 'sup_1',
    name: 'Acme Supplies',
    createdAt: '2026-01-01T00:00:00.000Z',
  };
  return vi.fn().mockReturnValue(of({ isSuccess: true as const, result: supplier }));
}

function createPurchaseOrdersStub(): ReturnType<typeof vi.fn> {
  return vi.fn().mockReturnValue(
    of({
      isSuccess: true as const,
      result: { data: [], info: { length: 0, skip: 0, totalCount: 0 } },
    }),
  );
}

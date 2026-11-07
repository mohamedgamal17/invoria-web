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

import { CustomerDetailsPageComponent } from './customer-details-page.component';
import { CustomersApiService } from '../../services/customers-api.service';
import { OrdersApiService } from '../../../orders/services/orders-api.service';
import {
  CUSTOMER_DETAILS_FEATURE_KEY,
  customerDetailsReducer,
  CustomerDetailsTab,
} from '../../store/customer-details/customer-details.reducer';
import { CustomerDetailsEffects } from '../../store/customer-details/customer-details.effects';
import {
  CUSTOMER_ORDERS_FEATURE_KEY,
  customerOrdersReducer,
} from '../../store/customer-details-orders/customer-details-orders.reducer';
import { CustomerOrdersEffects } from '../../store/customer-details-orders/customer-details-orders.effects';
import { CustomerDetailsUrlEffects } from '../../store/customer-details-url/customer-details-url.effects';
import { AppErrorEffects } from '../../../../shared/store/app-error.effects';
import type { Customer } from '../../models/customer.entity';

function createActivatedRouteMock(
  initialParams: Record<string, string> = { id: 'cust_1' }
) {
  const paramMap$ = new BehaviorSubject(convertToParamMap(initialParams));
  return {
    paramMap$,
    route: {
      paramMap: paramMap$.asObservable(),
      get snapshot() {
        return {
          paramMap: paramMap$.value
        };
      }
    }
  };
}

/**
 * Simulates the router-store actions the real router would emit for one
 * navigation: `ROUTER_NAVIGATION` (updates the store router state) plus
 * `ROUTER_NAVIGATED` (triggers the URL-sync effect).
 */
function navigateUrl(query: Record<string, string>, id = 'cust_1'): void {
  const store = TestBed.inject(Store);
  const routerState = fakeRouterState(query, id);
  const url = `/customers/${id}`;
  store.dispatch(
    routerNavigationAction({
      payload: {
        routerState: routerState,
        event: { id: 1, url, urlAfterRedirects: url } as unknown as RoutesRecognized
      }
    })
  );
  store.dispatch(
    routerNavigatedAction({
      payload: {
        routerState: routerState,
        event: { id: 1, url, urlAfterRedirects: url } as unknown as NavigationEnd
      }
    })
  );
}

/**
 * Minimal router-store snapshot (the shape the MinimalRouterStateSerializer
 * produces): `root.queryParams` carries the query, the leaf route carries
 * the `id` param — `selectCurrentRoute` walks `root.firstChild`.
 */
function fakeRouterState(
  queryParams: Record<string, string>,
  id: string
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
    children: []
  };
  return {
    url: `/customers/${id}`,
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
      children: [leafRoute]
    }
  } as unknown as SerializedRouterStateSnapshot;
}

function makeTestBed(
  overrides: {
    getCustomer?: ReturnType<typeof vi.fn>;
    listOrders?: ReturnType<typeof vi.fn>;
    initialParams?: Record<string, string>;
  } = {}
) {
  const getCustomer =
    overrides.getCustomer ??
    vi.fn().mockReturnValue(
      of({
        isSuccess: true as const,
        result: {
          id: 'cust_1',
          name: 'Acme Retail',
          createdAt: '2026-01-01T00:00:00.000Z'
        } satisfies Customer
      })
    );

  const listOrders =
    overrides.listOrders ??
    vi.fn().mockReturnValue(
      of({
        isSuccess: true as const,
        result: {
          data: [],
          info: { length: 0, skip: 0, totalCount: 0 }
        }
      })
    );

  const { route, paramMap$ } = createActivatedRouteMock(
    overrides.initialParams ?? { id: 'cust_1' }
  );

  const providers = [
    provideStore({}),
    provideState('router', routerReducer),
    provideState(CUSTOMER_DETAILS_FEATURE_KEY, customerDetailsReducer),
    provideState(CUSTOMER_ORDERS_FEATURE_KEY, customerOrdersReducer),
    provideEffects(
      CustomerDetailsEffects,
      CustomerOrdersEffects,
      CustomerDetailsUrlEffects,
      AppErrorEffects
    ),
    MessageService,
    { provide: CustomersApiService, useValue: { getCustomer } },
    { provide: OrdersApiService, useValue: { listOrders } },
    { provide: ActivatedRoute, useValue: route },
    { provide: Router, useValue: { navigate: vi.fn().mockResolvedValue(true) } }
  ];

  return { getCustomer, listOrders, paramMap$, providers };
}

async function bootstrap(
  overrides: Parameters<typeof makeTestBed>[0]
): Promise<FixtureBundle> {
  TestBed.resetTestingModule();
  const { providers, paramMap$ } = makeTestBed(overrides);
  await TestBed.configureTestingModule({
    imports: [CustomerDetailsPageComponent, NoopAnimationsModule],
    providers
  }).compileComponents();

  const fixture = TestBed.createComponent(CustomerDetailsPageComponent);
  const component = fixture.componentInstance;
  fixture.detectChanges();
  return { fixture, component, paramMap$ };
}

interface FixtureBundle {
  fixture: ComponentFixture<CustomerDetailsPageComponent>;
  component: CustomerDetailsPageComponent;
  paramMap$: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
}

describe('CustomerDetailsPageComponent (NgRx stores)', () => {
  beforeEach(() => {
    if (typeof globalThis.ResizeObserver === 'undefined') {
      globalThis.ResizeObserver = class {
        observe(): void {}
        unobserve(): void {}
        disconnect(): void {};
      };
    }
  });

  it('loads the customer through the details store on page mount', async () => {
    const getCustomer = createCustomerStub();
    const bundle = await bootstrap({ getCustomer, listOrders: createOrdersStub() });

    expect(getCustomer).toHaveBeenCalledWith('cust_1');
    expect(bundle.component.customer()?.id).toBe('cust_1');
    expect(bundle.component.loading()).toBe(false);
  });

  it('does not fetch orders until the Orders tab is opened', async () => {
    const listOrders = createOrdersStub();
    const { component, fixture } = await bootstrap({ listOrders });

    expect(listOrders).not.toHaveBeenCalled();

    component.onTabChange(CustomerDetailsTab.Orders);
    fixture.detectChanges();

    expect(listOrders).toHaveBeenCalledTimes(1);
    const request = listOrders.mock.calls[0][0];
    expect(request.CustomerId).toBe('cust_1');
    expect(request.Skip).toBe(0);
    expect(request.Length).toBe(25);
    expect(component.activeTab()).toBe(CustomerDetailsTab.Orders);
  });

  it('applies the `tab=orders` query into the store after the customer is loaded', async () => {
    const listOrders = createOrdersStub();
    const { component, fixture } = await bootstrap({ listOrders });

    navigateUrl({ tab: 'orders' });
    fixture.detectChanges();

    expect(component.activeTab()).toBe(CustomerDetailsTab.Orders);
    expect(listOrders).toHaveBeenCalledTimes(1);
  });

  it('applies URL paging into the orders state before any fetch', async () => {
    const listOrders = createOrdersStub();
    const { component, fixture } = await bootstrap({ listOrders });

    // The URL adapter: paging observed from the query while the tab is still closed.
    navigateUrl({ page: '2', rows: '50' });
    fixture.detectChanges();
    expect(listOrders).not.toHaveBeenCalled(); // tab gate keeps it idle

    // Opening the Orders tab reads the URL-backed paging values from state.
    component.onTabChange(CustomerDetailsTab.Orders);
    fixture.detectChanges();

    expect(listOrders).toHaveBeenCalledTimes(1);
    const request = listOrders.mock.calls[0][0];
    expect(request.Skip).toBe(100);
    expect(request.Length).toBe(50);
  });

  it('ignores an unknown tab slug and keeps the default paging values', async () => {
    const listOrders = createOrdersStub();
    const { component, fixture } = await bootstrap({ listOrders });

    navigateUrl({ tab: 'bogus', page: '-3', rows: '12345' });
    fixture.detectChanges();

    expect(component.activeTab()).toBe(CustomerDetailsTab.Profile);
    expect(listOrders).not.toHaveBeenCalled();

    // With no URL params the state stays at its defaults: page 0 / rows 25.
    component.onTabChange(CustomerDetailsTab.Orders);
    fixture.detectChanges();
    const request = listOrders.mock.calls[0][0];
    expect(request.Skip).toBe(0);
    expect(request.Length).toBe(25);
  });

  it('writes tab/page/rows query params back on tab change', async () => {
    const { component } = await bootstrap({});
    const router = TestBed.inject(Router);

    component.onTabChange(CustomerDetailsTab.Orders);

    expect(router.navigate).toHaveBeenCalledWith(
      [],
      expect.objectContaining({
        replaceUrl: true,
        queryParams: expect.objectContaining({ tab: 'orders' })
      })
    );
  });

  it('navigates back to the customers list', async () => {
    const { component } = await bootstrap({});
    const router = TestBed.inject(Router);

    component.backToList();

    expect(router.navigate).toHaveBeenCalledWith(['/customers']);
  });

  it('reloads the customer when the :id param changes', async () => {
    const customer = {
      id: 'cust_1',
      name: 'Acme Retail',
      createdAt: '2026-01-01T00:00:00.000Z'
    } satisfies Customer;
    const customer2 = { ...customer, id: 'cust_2', name: 'Beta Co' } satisfies Customer;
    const getCustomer = vi.fn().mockImplementation((id: string) =>
      of(
        id === 'cust_1'
          ? { isSuccess: true as const, result: customer }
          : { isSuccess: true as const, result: customer2 }
      )
    );

    const { paramMap$, component, fixture } = await bootstrap({ getCustomer });
    expect(component.customer()?.id).toBe('cust_1');

    paramMap$.next(convertToParamMap({ id: 'cust_2' }));
    fixture.detectChanges();

    expect(getCustomer).toHaveBeenCalledWith('cust_2');
    expect(component.customer()?.id).toBe('cust_2');
  });
});

describe('CustomerDetailsPageComponent error presentation', () => {
  beforeEach(() => {
    if (typeof globalThis.ResizeObserver === 'undefined') {
      globalThis.ResizeObserver = class {
        observe(): void {}
        unobserve(): void {}
        disconnect(): void {};
      };
    }
  });

  it('presents the load failure via the global error effect and keeps the inline error', async () => {
    const failedGetCustomer = vi.fn().mockReturnValue(
      of({
        isSuccess: false as const,
        error: { kind: 'api', title: 'Request failed', detail: 'Server error' }
      })
    );
    const { providers } = makeTestBed({
      getCustomer: failedGetCustomer,
      initialParams: { id: 'cust_fail' }
    });

    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [CustomerDetailsPageComponent, NoopAnimationsModule],
      providers
    }).compileComponents();

    const addSpy = vi.spyOn(TestBed.inject(MessageService), 'add');
    const fixture = TestBed.createComponent(CustomerDetailsPageComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    expect(addSpy).toHaveBeenCalled();
    expect(component.customer()).toBeNull();
    expect(component.error()).toBeTruthy();
  });
});

/* ------------------------------------------------------------------ */
/* helpers                                                            */
/* ------------------------------------------------------------------ */

function createCustomerStub(): ReturnType<typeof vi.fn> {
  const customer: Customer = { id: 'cust_1', name: 'Acme Retail', createdAt: '2026-01-01T00:00:00.000Z' };
  return vi.fn().mockReturnValue(of({ isSuccess: true as const, result: customer }));
}

function createOrdersStub(): ReturnType<typeof vi.fn> {
  return vi.fn().mockReturnValue(
    of({
      isSuccess: true as const,
      result: { data: [], info: { length: 0, skip: 0, totalCount: 0 } }
    })
  );
}

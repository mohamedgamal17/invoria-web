import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Store, provideStore, provideState } from '@ngrx/store';

import { CustomersPageComponent } from './customers-page.component';
import type { Customer } from '../../models/customer.entity';
import {
  CUSTOMERS_LIST_FEATURE_KEY,
  CUSTOMERS_LIST_INITIAL_STATE,
  customersListReducer,
} from '../../store/customers-list/customers-list.reducer';
import { CUSTOMERS_LIST_ACTIONS } from '../../store/customers-list/customers-list.actions';

describe('CustomersPageComponent', () => {
  let component: CustomersPageComponent;
  let fixture: ComponentFixture<CustomersPageComponent>;
  let store: Store;
  let scrollToSpy: { mockClear: () => void };

  const mockCustomer: Customer = {
    id: 'cust_1',
    name: 'Acme Corp',
    createdAt: '2026-01-01T00:00:00.000Z'
  };

  async function createFixture(
    query = { pageIndex: 0, pageSize: 25, nameFilter: '' }
  ): Promise<void> {
    TestBed.resetTestingModule();
    scrollToSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});

    await TestBed.configureTestingModule({
      imports: [CustomersPageComponent, NoopAnimationsModule],
      providers: [
        MessageService,
        provideStore({}),
        provideState(CUSTOMERS_LIST_FEATURE_KEY, customersListReducer),
        {
          provide: ActivatedRoute,
          useValue: { parent: { snapshot: { url: [] } } }
        },
        {
          provide: Router,
          useValue: { navigate: vi.fn().mockResolvedValue(true) }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CustomersPageComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(Store);

    store.dispatch(CUSTOMERS_LIST_ACTIONS.setQueryFromUrl(query));
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await createFixture();
  });

  it('should create with idle list state', () => {
    expect(component).toBeTruthy();
    expect(component.customers()).toEqual([]);
    expect(component.paging().totalCount).toBe(0);
    expect(component.listLoading()).toBe(false);
  });

  it('should expose customers loaded through the store selectors', () => {
    store.dispatch(
      CUSTOMERS_LIST_ACTIONS.loadCustomersSuccess({
        customers: [mockCustomer],
        info: { length: 25, skip: 0, totalCount: 1 }
      })
    );
    fixture.detectChanges();

    expect(component.customers()).toEqual([mockCustomer]);
    expect(component.paging().totalCount).toBe(1);
    expect(component.first()).toBe(0);
  });

  it('goToCreate should navigate to new relative to route', () => {
    const router = TestBed.inject(Router);
    const route = TestBed.inject(ActivatedRoute);
    component.goToCreate();
    expect(router.navigate).toHaveBeenCalledWith(['new'], { relativeTo: route });
  });

  it('goToDetails should navigate to customer id', () => {
    const router = TestBed.inject(Router);
    const route = TestBed.inject(ActivatedRoute);
    component.goToDetails(mockCustomer);
    expect(router.navigate).toHaveBeenCalledWith([mockCustomer.id], { relativeTo: route });
  });

  it('onPageChange should sync page/pageSize to route and scroll on manual page change', () => {
    const router = TestBed.inject(Router);
    const route = TestBed.inject(ActivatedRoute);

    component.onPageChange({ first: 100, rows: 25, page: 4 });

    expect(router.navigate).toHaveBeenCalledWith([], {
      relativeTo: route,
      queryParams: { page: 5, pageSize: 25 },
      queryParamsHandling: 'merge'
    });
    expect(scrollToSpy).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });

  it('onPageChange should scroll only when the page index really changes', () => {
    scrollToSpy.mockClear();
    component.onPageChange({ first: 0, rows: 50, page: 0 });
    expect(scrollToSpy).not.toHaveBeenCalled();
  });

  it('onFiltersChange should sync q to route and reset page', () => {
    const router = TestBed.inject(Router);
    const route = TestBed.inject(ActivatedRoute);

    component.onFiltersChange({ name: 'acme' });

    expect(router.navigate).toHaveBeenCalledWith([], {
      relativeTo: route,
      queryParams: { q: 'acme', page: 1 },
      queryParamsHandling: 'merge'
    });
  });

  it('onFiltersChange should no-op when name unchanged', () => {
    const router = TestBed.inject(Router);
    vi.mocked(router.navigate).mockClear();

    component.onFiltersChange({ name: '' });

    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('onClearFilters should clear q and reset page', async () => {
    await createFixture({ pageIndex: 0, pageSize: 25, nameFilter: 'acme' });
    const router = TestBed.inject(Router);
    const route = TestBed.inject(ActivatedRoute);
    expect(component.nameFilter()).toBe('acme');
    vi.mocked(router.navigate).mockClear();

    component.onClearFilters();

    expect(router.navigate).toHaveBeenCalledWith([], {
      relativeTo: route,
      queryParams: { q: null, page: 1 },
      queryParamsHandling: 'merge'
    });
  });

  it('onClearFilters should no-op when name filter already empty', () => {
    const router = TestBed.inject(Router);
    vi.mocked(router.navigate).mockClear();

    component.onClearFilters();

    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should sync name filter from the store (URL effect applies the state)', async () => {
    await createFixture({ pageIndex: 0, pageSize: 25, nameFilter: 'acme' });
    expect(component.nameFilter()).toBe('acme');
    expect(CUSTOMERS_LIST_INITIAL_STATE.pageSize).toBe(25);
  });
});

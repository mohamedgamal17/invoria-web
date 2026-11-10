import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Store, provideStore, provideState } from '@ngrx/store';

import { SuppliersPageComponent } from './suppliers-page.component';
import type { Supplier } from '../../models/supplier.entity';
import {
  SUPPLIERS_LIST_FEATURE_KEY,
  suppliersListReducer,
  type SuppliersListState,
} from '../../store/suppliers-list/suppliers-list.reducer';
import { SUPPLIERS_LIST_ACTIONS } from '../../store/suppliers-list/suppliers-list.actions';

describe('SuppliersPageComponent (NgRx store)', () => {
  let component: SuppliersPageComponent;
  let fixture: ComponentFixture<SuppliersPageComponent>;
  let store: Store;
  let scrollToSpy: { mockClear: () => void };

  const mockSupplier: Supplier = {
    id: 'sup_1',
    name: 'Acme Supplies',
    createdAt: '2026-01-01T00:00:00.000Z',
  };

  async function createFixture(state: Partial<SuppliersListState> = {}): Promise<void> {
    TestBed.resetTestingModule();
    scrollToSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});

    await TestBed.configureTestingModule({
      imports: [SuppliersPageComponent, NoopAnimationsModule],
      providers: [
        MessageService,
        provideStore({}),
        provideState(SUPPLIERS_LIST_FEATURE_KEY, suppliersListReducer),
        {
          provide: ActivatedRoute,
          useValue: { parent: { snapshot: { url: [] } } },
        },
        {
          provide: Router,
          useValue: { navigate: vi.fn().mockResolvedValue(true) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SuppliersPageComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(Store);

    store.dispatch(
      SUPPLIERS_LIST_ACTIONS.setQueryFromUrl({ pageIndex: 0, pageSize: 25, nameFilter: '' }),
    );
    if (state.suppliers !== undefined || state.info !== undefined) {
      store.dispatch(
        SUPPLIERS_LIST_ACTIONS.loadSuppliersSuccess({
          suppliers: state.suppliers ?? [],
          info: state.info ?? { length: 0, skip: 0, totalCount: 0 },
        }),
      );
    }
    if (
      state.pageIndex !== undefined ||
      state.pageSize !== undefined ||
      state.nameFilter !== undefined
    ) {
      store.dispatch(
        SUPPLIERS_LIST_ACTIONS.setQueryFromUrl({
          pageIndex: state.pageIndex ?? 0,
          pageSize: state.pageSize ?? 25,
          nameFilter: state.nameFilter ?? '',
        }),
      );
    }
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await createFixture();
  });

  it('should create with idle list state followed by a load through the store', async () => {
    await createFixture({
      suppliers: [mockSupplier],
      info: { length: 25, skip: 0, totalCount: 1 },
    });

    expect(component).toBeTruthy();
    expect(component.suppliers()).toEqual([mockSupplier]);
    expect(component.paging().totalCount).toBe(1);
    expect(component.listLoading()).toBe(false);
  });

  it('should create with empty list state before any data arrives', async () => {
    expect(component.suppliers()).toEqual([]);
    expect(component.paging().totalCount).toBe(0);
    expect(component.listLoading()).toBe(false);
  });

  it('goToCreate should navigate to new relative to route', () => {
    const router = TestBed.inject(Router);
    const route = TestBed.inject(ActivatedRoute);
    component.goToCreate();
    expect(router.navigate).toHaveBeenCalledWith(['new'], { relativeTo: route });
  });

  it('goToDetails should navigate to supplier id', () => {
    const router = TestBed.inject(Router);
    const route = TestBed.inject(ActivatedRoute);
    component.goToDetails(mockSupplier);
    expect(router.navigate).toHaveBeenCalledWith([mockSupplier.id], { relativeTo: route });
  });

  it('onPageChange should sync page/pageSize to route', async () => {
    await createFixture({ pageIndex: 0, pageSize: 25 });
    const router = TestBed.inject(Router);
    const route = TestBed.inject(ActivatedRoute);

    component.onPageChange({ first: 25, rows: 25, page: 1, pageCount: 3 });

    expect(router.navigate).toHaveBeenCalledWith([], {
      relativeTo: route,
      queryParams: { page: 2, pageSize: 25 },
      queryParamsHandling: 'merge',
    });
    expect(scrollToSpy).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });

  it('onPageChange should not scroll when the page index is unchanged', async () => {
    await createFixture({ pageIndex: 1, pageSize: 25 });
    vi.mocked(TestBed.inject(Router).navigate).mockClear();
    scrollToSpy.mockClear();

    component.onPageChange({ first: 50, rows: 50, page: 1, pageCount: 2 });

    expect(scrollToSpy).not.toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });

  it('onFiltersChange should sync q to route and reset page', () => {
    const router = TestBed.inject(Router);
    const route = TestBed.inject(ActivatedRoute);

    component.onFiltersChange({ name: 'acme' });

    expect(router.navigate).toHaveBeenCalledWith([], {
      relativeTo: route,
      queryParams: { q: 'acme', page: 1 },
      queryParamsHandling: 'merge',
    });
  });

  it('onFiltersChange should no-op when the name already matches the store filter', async () => {
    await createFixture({ nameFilter: 'acme' });
    const router = TestBed.inject(Router);
    vi.mocked(router.navigate).mockClear();

    component.onFiltersChange({ name: 'acme' });

    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('onClearFilters should clear q and reset page', async () => {
    await createFixture({ nameFilter: 'acme' });
    const router = TestBed.inject(Router);
    const route = TestBed.inject(ActivatedRoute);
    vi.mocked(router.navigate).mockClear();

    component.onClearFilters();

    expect(router.navigate).toHaveBeenCalledWith([], {
      relativeTo: route,
      queryParams: { q: null, page: 1 },
      queryParamsHandling: 'merge',
    });
  });

  it('onClearFilters should no-op when the store filter is already empty', () => {
    const router = TestBed.inject(Router);
    vi.mocked(router.navigate).mockClear();

    component.onClearFilters();

    expect(router.navigate).not.toHaveBeenCalled();
  });
});

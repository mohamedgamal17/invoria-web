import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

import { MessageService } from 'primeng/api';
import { provideStore, provideState, Store } from '@ngrx/store';

import { SupplierFormPageComponent } from './supplier-form-page.component';
import { SuppliersApiService } from '../../services/suppliers-api.service';
import { SUPPLIER_MUTATIONS_ACTIONS } from '../../store/supplier-mutations/supplier-mutations.actions';
import {
  SUPPLIER_MUTATIONS_FEATURE_KEY,
  supplierMutationsReducer,
  type SupplierMutationsState,
} from '../../store/supplier-mutations/supplier-mutations.reducer';

describe('SupplierFormPageComponent (NgRx mutations)', () => {
  let component: SupplierFormPageComponent;
  let fixture: ComponentFixture<SupplierFormPageComponent>;
  let store: Store;
  let dispatchSpy: ReturnType<typeof vi.fn>;

  async function createFormFixture(
    mode: 'create' | 'edit',
    state: Partial<SupplierMutationsState> = {},
  ): Promise<void> {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [SupplierFormPageComponent, NoopAnimationsModule],
      providers: [
        MessageService,
        provideStore({}),
        provideState(SUPPLIER_MUTATIONS_FEATURE_KEY, supplierMutationsReducer),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: { mode },
              paramMap: { get: () => (mode === 'edit' ? 'sup_1' : null) },
              url: [],
              parent: null,
            },
          },
        },
        { provide: Router, useValue: { navigate: vi.fn().mockResolvedValue(true) } },
        {
          provide: SuppliersApiService,
          useValue: {
            createSupplier: vi.fn().mockReturnValue(
              of({
                isSuccess: true as const,
                result: { id: 'new_id', name: 'Y', createdAt: '2026-01-01T00:00:00.000Z' },
              }),
            ),
            getSupplier: vi.fn().mockReturnValue(
              of({
                isSuccess: true as const,
                result: { id: 'sup_1', name: 'Alpha', contactEmail: null, phone: null },
              }),
            ),
            updateSupplier: vi.fn(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SupplierFormPageComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(Store);

    if (state.createRequest) {
      store.dispatch(SUPPLIER_MUTATIONS_ACTIONS.createSupplier({ request: { Name: 'Primed' } }));
      store.dispatch(
        SUPPLIER_MUTATIONS_ACTIONS.createSupplierFailure({ error: new Error('boom') }),
      );
    }
    dispatchSpy = vi.spyOn(store, 'dispatch');
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await createFormFixture('create');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.mode()).toBe('create');
    expect(component.saving()).toBe(false);
  });

  it('submit should dispatch createSupplier through the mutations store when valid', () => {
    component.form.patchValue({ name: 'Valid Name', contactEmail: '', phone: '' });
    component.submit();

    const action = dispatchSpy.mock.calls.at(-1)?.[0];
    expect(action?.type).toBe(SUPPLIER_MUTATIONS_ACTIONS.createSupplier.type);
    expect(action?.request).toEqual({ Name: 'Valid Name', ContactEmail: null, Phone: null });
  });

  it('submit should not dispatch when the form is invalid', () => {
    component.form.patchValue({ name: 'x', contactEmail: '', phone: '' });
    const snapshot = dispatchSpy.mock.calls.length;
    component.submit();

    // Only the form-unrelated priming dispatches happened before the snapshot.
    expect(dispatchSpy.mock.calls.length).toBe(snapshot);
  });

  it('saving should follow the mutations store while a create is in flight', async () => {
    await createFormFixture('create');
    store.dispatch(SUPPLIER_MUTATIONS_ACTIONS.createSupplier({ request: { Name: 'Primed' } }));
    fixture.detectChanges();

    expect(component.saving()).toBe(true);
  });

  it('submit should dispatch updateSupplier with the route id in edit mode', async () => {
    await createFormFixture('edit');
    component.form.patchValue({ name: 'Updated Name', contactEmail: '', phone: '' });
    component.submit();

    const action = dispatchSpy.mock.calls.at(-1)?.[0];
    expect(action?.type).toBe(SUPPLIER_MUTATIONS_ACTIONS.updateSupplier.type);
    expect(action?.id).toBe('sup_1');
    expect(action?.request).toEqual({ Name: 'Updated Name', ContactEmail: null, Phone: null });
  });
});

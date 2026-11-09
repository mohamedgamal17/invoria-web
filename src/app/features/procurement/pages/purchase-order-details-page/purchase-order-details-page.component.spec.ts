import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { Store, provideStore, provideState } from '@ngrx/store';
import { ConfirmationService, MessageService } from 'primeng/api';

import { PurchaseOrderDetailsPageComponent } from './purchase-order-details-page.component';
import type { PurchaseOrder } from '../../models/purchase-order.entity';
import { PurchaseState } from '../../enums/purchase-state.enum';
import { purchaseStateLabel } from '../../models/purchase-state.display';
import {
  PURCHASE_ORDER_DETAILS_FEATURE_KEY,
  purchaseOrderDetailsReducer,
} from '../../store/purchase-order-details/purchase-order-details.reducer';
import { PURCHASE_ORDER_DETAILS_ACTIONS } from '../../store/purchase-order-details/purchase-order-details.actions';
import {
  PURCHASE_ORDERS_MUTATIONS_FEATURE_KEY,
  purchaseOrdersMutationsReducer,
} from '../../store/purchase-orders-mutations/purchase-orders-mutations.reducer';
import { PURCHASE_ORDERS_MUTATIONS_ACTIONS } from '../../store/purchase-orders-mutations/purchase-orders-mutations.actions';

function activatedRouteMock(id = 'po_1') {
  const getParam = (key: string): string | null => (key === 'id' ? id : null);
  return {
    snapshot: { paramMap: { get: getParam } },
    paramMap: of({ get: getParam }),
  };
}

describe('PurchaseOrderDetailsPageComponent', () => {
  let fixture: ComponentFixture<PurchaseOrderDetailsPageComponent>;
  let store: Store;
  let router: Router;

  beforeEach(() => {
    if (typeof globalThis.ResizeObserver === 'undefined') {
      globalThis.ResizeObserver = class {
        observe(): void {}
        unobserve(): void {}
        disconnect(): void {}
      };
    }
  });

  const mockPo: PurchaseOrder = {
    id: 'po_1',
    createdAt: '2026-01-01T00:00:00.000Z',
    createdBy: 'user_creator',
    lastModifiedAt: '2026-01-02T00:00:00.000Z',
    lastModifiedBy: 'user_editor',
    purchaseNumber: 'PO-100',
    supplierId: 'sup_1',
    supplier: { id: 'sup_1', name: 'Acme' },
    state: PurchaseState.Draft,
    completedDate: null,
    subTotal: 200,
    totalAmount: 218,
    purchaseOrderItems: [
      {
        id: 'poi_1',
        productId: 'prod_1',
        quantity: 2,
        unitPrice: 100,
        lineTotal: 200,
      },
    ],
    stateHistory: [
      { toState: PurchaseState.Draft, changedAt: '2026-01-01T08:00:00.000Z' },
      {
        fromState: PurchaseState.Draft,
        toState: PurchaseState.Submitted,
        changedAt: '2026-01-01T10:00:00.000Z',
        reason: 'Ready for review',
      },
    ],
  };

  async function createFixture(po: PurchaseOrder = mockPo): Promise<void> {
    TestBed.resetTestingModule();

    await TestBed.configureTestingModule({
      imports: [PurchaseOrderDetailsPageComponent, NoopAnimationsModule],
      providers: [
        MessageService,
        ConfirmationService,
        provideStore({}),
        provideState(PURCHASE_ORDER_DETAILS_FEATURE_KEY, purchaseOrderDetailsReducer),
        provideState(PURCHASE_ORDERS_MUTATIONS_FEATURE_KEY, purchaseOrdersMutationsReducer),
        provideRouter([]),
        { provide: ActivatedRoute, useValue: activatedRouteMock() },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PurchaseOrderDetailsPageComponent);
    store = TestBed.inject(Store);
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture.detectChanges();
    store.dispatch(PURCHASE_ORDER_DETAILS_ACTIONS.loadPurchaseOrderSuccess({ purchaseOrder: po }));
    fixture.detectChanges();
    await fixture.whenStable();
  }

  it('should expose the purchase order loaded through the store selectors', async () => {
    await createFixture();
    const component = fixture.componentInstance;

    expect(component.purchaseOrder()).toEqual(mockPo);
    expect(component.loading()).toBe(false);
    expect(component.error()).toBeNull();
    expect(component.purchaseOrder()?.purchaseNumber).toBe('PO-100');
    expect(component.purchaseOrder()?.subTotal).toBe(200);
    expect(component.purchaseOrder()?.totalAmount).toBe(218);
  });

  it('should compute stateTimelineEvents correctly', async () => {
    await createFixture();
    const events = fixture.componentInstance.stateTimelineEvents();
    expect(events).toHaveLength(2);
    expect(events[0].toLabel).toBe(purchaseStateLabel(PurchaseState.Draft));
    expect(events[1].toLabel).toBe(purchaseStateLabel(PurchaseState.Submitted));
    expect(events[1].reason).toBe('Ready for review');
  });

  it('should produce empty stateTimelineEvents when stateHistory is absent', async () => {
    const poNoHistory: PurchaseOrder = { ...mockPo };
    delete (poNoHistory as { stateHistory?: unknown }).stateHistory;
    await createFixture(poNoHistory);

    expect(fixture.componentInstance.stateTimelineEvents()).toEqual([]);
  });

  it('should reflect canEdit and availableTransitions for Draft state', async () => {
    await createFixture();
    const component = fixture.componentInstance;
    expect(component.canEdit()).toBe(true);
    expect(component.availableTransitions()).toContain('submit');
    expect(component.availableTransitions()).toContain('cancel');
  });

  it('should show Reopen and Complete without Edit when order is Approved', async () => {
    await createFixture({ ...mockPo, state: PurchaseState.Approved, stateHistory: [] });
    const component = fixture.componentInstance;
    expect(component.canEdit()).toBe(false);
    expect(component.availableTransitions()).toContain('reopen');
    expect(component.availableTransitions()).toContain('complete');
  });

  it('should update activeTab via onTabChange and write the tab slug to the URL', async () => {
    await createFixture();
    const component = fixture.componentInstance;
    const route = TestBed.inject(ActivatedRoute);

    component.onTabChange('lines');
    expect(component.activeTab()).toBe('lines');
    expect(router.navigate).toHaveBeenCalledWith(
      [],
      expect.objectContaining({
        relativeTo: route,
        replaceUrl: true,
        queryParams: { tab: 'lines' },
      }),
    );

    component.onTabChange('history');
    expect(component.activeTab()).toBe('history');
  });

  it('should ignore unknown tab values in onTabChange', async () => {
    await createFixture();
    const component = fixture.componentInstance;

    component.onTabChange('nope');
    expect(component.activeTab()).toBe('overview');

    component.onTabChange(undefined);
    expect(component.activeTab()).toBe('overview');
  });

  it('should resolve line labels from the store name lookups', async () => {
    await createFixture();
    const component = fixture.componentInstance;
    const line = mockPo.purchaseOrderItems![0];

    expect(component.productLineLabel(line)).toBe(line.productId);

    store.dispatch(
      PURCHASE_ORDER_DETAILS_ACTIONS.productNamesResolved({
        names: new Map([['prod_1', 'Resolved product name']]),
      }),
    );
    expect(component.productLineLabel(line)).toBe('Resolved product name');

    expect(component.productLineLabel({ ...line, productName: 'Embedded name' })).toBe(
      'Embedded name',
    );
  });

  it('should dispatch the transition and reflect the in-progress flag', async () => {
    await createFixture();
    const component = fixture.componentInstance;

    expect(component.transitionInProgress()).toBe(false);
    component.onTransition('submit');

    expect(component.transitionInProgress()).toBe(true);
    expect(component.purchaseOrder()).toEqual(mockPo);
  });

  it('should not dispatch a transition while one is in flight', async () => {
    await createFixture();
    const component = fixture.componentInstance;
    component.onTransition('submit');
    expect(component.transitionInProgress()).toBe(true);

    component.onTransition('approve');
    expect(component.transitionInProgress()).toBe(true);
  });

  it('should fold a transition success into the held purchase order without refetching', async () => {
    await createFixture();
    const component = fixture.componentInstance;
    component.onTransition('approve');

    const updated: PurchaseOrder = { ...mockPo, state: PurchaseState.Approved };
    store.dispatch(
      PURCHASE_ORDERS_MUTATIONS_ACTIONS.transitionPurchaseOrderSuccess({ purchaseOrder: updated }),
    );

    expect(component.purchaseOrder()).toBe(updated);
    expect(component.canEdit()).toBe(false);
  });

  it('should re-trigger the load on retry', async () => {
    await createFixture();
    fixture.componentInstance.retry();

    expect(fixture.componentInstance.loading()).toBe(true);
    expect(fixture.componentInstance.purchaseOrder()).toBeNull();
  });

  it('should navigate back to procurement list', async () => {
    await createFixture();
    fixture.componentInstance.backToList();
    expect(router.navigate).toHaveBeenCalledWith(['/procurement']);
  });

  it('supplierLine should fall back to supplierId when supplier name is absent', async () => {
    await createFixture();
    const component = fixture.componentInstance;
    const poNoSupplierName: PurchaseOrder = {
      ...mockPo,
      supplier: { id: 'sup_1', name: '' },
    };
    expect(component.supplierLine(poNoSupplierName)).toBe(mockPo.supplierId);

    const poNoSupplier: PurchaseOrder = { ...mockPo, supplier: null };
    expect(component.supplierLine(poNoSupplier)).toBe(mockPo.supplierId);
  });

  it('formatDateOrDash should return an em dash for missing or invalid dates', async () => {
    await createFixture();
    const component = fixture.componentInstance;
    expect(component.formatDateOrDash(null)).toBe('—');
    expect(component.formatDateOrDash('')).toBe('—');
    expect(component.formatDateOrDash('not-a-date')).toBe('—');
  });
});

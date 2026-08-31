import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { of } from 'rxjs';

import { ConfirmationService, MessageService } from 'primeng/api';

import { PurchaseOrderDetailsPageComponent } from './purchase-order-details-page.component';
import { PurchaseOrdersApiService } from '../../services/purchase-orders-api.service';
import { ProductsApiService } from '../../../products/services/products-api.service';
import type { PurchaseOrder } from '../../models/purchase-order.entity';
import { PurchaseState } from '../../enums/purchase-state.enum';
import { purchaseStateLabel } from '../../models/purchase-state.display';

function activatedRouteMock(query: Record<string, string> = {}) {
  const queryParamMap = convertToParamMap(query);
  return {
    snapshot: {
      paramMap: convertToParamMap({ id: 'po_1' }),
      queryParamMap
    },
    paramMap: of(convertToParamMap({ id: 'po_1' })),
    queryParamMap: of(queryParamMap)
  };
}

describe('PurchaseOrderDetailsPageComponent', () => {
  let fixture: ComponentFixture<PurchaseOrderDetailsPageComponent>;

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
    orderDate: '2026-01-10T00:00:00.000Z',
    expectedDeliveryDate: '2026-01-20T00:00:00.000Z',
    completedDate: null,
    subTotal: 200,
    taxAmount: 28,
    discountAmount: 10,
    totalAmount: 218,
    purchaseOrderItems: [
      {
        id: 'poi_1',
        productId: 'prod_1',
        quantity: 2,
        unitPrice: 100,
        supplierProductCode: 'SKU-1',
        lineTotal: 200
      }
    ],
    stateHistory: [
      { toState: PurchaseState.Draft, changedAt: '2026-01-01T08:00:00.000Z' },
      {
        fromState: PurchaseState.Draft,
        toState: PurchaseState.Submitted,
        changedAt: '2026-01-01T10:00:00.000Z',
        reason: 'Ready for review'
      }
    ]
  };

  beforeEach(async () => {
    TestBed.resetTestingModule();

    const getPurchaseOrder = vi.fn().mockReturnValue(
      of({ isSuccess: true as const, result: mockPo })
    );
    const apiMock = {
      getPurchaseOrder,
      submitPurchaseOrder: vi.fn(),
      approvePurchaseOrder: vi.fn(),
      rejectPurchaseOrder: vi.fn(),
      cancelPurchaseOrder: vi.fn(),
      completePurchaseOrder: vi.fn(),
      reopenPurchaseOrder: vi.fn()
    };
    const productsApiMock = {
      getProduct: vi.fn().mockReturnValue(
        of({
          isSuccess: true as const,
          result: {
            id: 'prod_1',
            name: 'Resolved product name',
            price: 100,
            stock: {
              actualQuantity: 0,
              reservedQuantity: 0
            },
            createdAt: '',
            createdBy: '',
            lastModifiedAt: '',
            lastModifiedBy: ''
          }
        })
      )
    };

    await TestBed.configureTestingModule({
      imports: [PurchaseOrderDetailsPageComponent, NoopAnimationsModule],
      providers: [
        MessageService,
        ConfirmationService,
        { provide: PurchaseOrdersApiService, useValue: apiMock },
        { provide: ProductsApiService, useValue: productsApiMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock() },
        { provide: Router, useValue: { navigate: vi.fn().mockResolvedValue(true) } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PurchaseOrderDetailsPageComponent);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create and load purchase order', () => {
    const api = TestBed.inject(PurchaseOrdersApiService);
    const component = fixture.componentInstance;

    expect(api.getPurchaseOrder).toHaveBeenCalledWith('po_1');
    expect(component.purchaseOrder()).toEqual(mockPo);
    expect(component.loading()).toBe(false);
    expect(component.error()).toBe('');
  });

  it('should expose purchase order fields via signals', () => {
    const component = fixture.componentInstance;
    const loaded = component.purchaseOrder();
    expect(loaded?.purchaseNumber).toBe(mockPo.purchaseNumber);
    expect(loaded?.orderDate).toBe(mockPo.orderDate);
    expect(loaded?.subTotal).toBe(mockPo.subTotal);
    expect(loaded?.taxAmount).toBe(mockPo.taxAmount);
    expect(loaded?.discountAmount).toBe(mockPo.discountAmount);
    expect(loaded?.totalAmount).toBe(mockPo.totalAmount);
  });

  it('should compute stateTimelineEvents correctly', () => {
    const component = fixture.componentInstance;
    const events = component.stateTimelineEvents();
    expect(events).toHaveLength(2);
    expect(events[0].toLabel).toBe(purchaseStateLabel(PurchaseState.Draft));
    expect(events[1].toLabel).toBe(purchaseStateLabel(PurchaseState.Submitted));
    expect(events[1].reason).toBe('Ready for review');
  });

  it('should reflect canEdit and availableTransitions for Draft state', () => {
    const component = fixture.componentInstance;
    expect(component.canEdit()).toBe(true);
    expect(component.availableTransitions()).toContain('submit');
    expect(component.availableTransitions()).toContain('cancel');
  });

  it('should update activeTab via onTabChange', () => {
    const component = fixture.componentInstance;
    expect(component.activeTab()).toBe(0);
    component.onTabChange(1);
    expect(component.activeTab()).toBe(1);
    expect(component.productLineLabel(mockPo.purchaseOrderItems![0])).toBe('Resolved product name');
    component.onTabChange(2);
    expect(component.activeTab()).toBe(2);
  });

  it('should show Reopen and Complete without Edit when order is Approved', async () => {
    TestBed.resetTestingModule();
    const approvedPo: PurchaseOrder = {
      ...mockPo,
      state: PurchaseState.Approved,
      stateHistory: []
    };
    const getPurchaseOrder = vi.fn().mockReturnValue(
      of({ isSuccess: true as const, result: approvedPo })
    );
    const apiMock = {
      getPurchaseOrder,
      submitPurchaseOrder: vi.fn(),
      approvePurchaseOrder: vi.fn(),
      rejectPurchaseOrder: vi.fn(),
      cancelPurchaseOrder: vi.fn(),
      completePurchaseOrder: vi.fn(),
      reopenPurchaseOrder: vi.fn()
    };
    const productsApiMock = {
      getProduct: vi.fn().mockReturnValue(of({ isSuccess: false as const, result: undefined }))
    };

    await TestBed.configureTestingModule({
      imports: [PurchaseOrderDetailsPageComponent, NoopAnimationsModule],
      providers: [
        MessageService,
        ConfirmationService,
        { provide: PurchaseOrdersApiService, useValue: apiMock },
        { provide: ProductsApiService, useValue: productsApiMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock() },
        { provide: Router, useValue: { navigate: vi.fn().mockResolvedValue(true) } }
      ]
    }).compileComponents();

    const approvedFixture = TestBed.createComponent(PurchaseOrderDetailsPageComponent);
    approvedFixture.detectChanges();
    await approvedFixture.whenStable();

    const comp = approvedFixture.componentInstance;
    expect(comp.canEdit()).toBe(false);
    expect(comp.availableTransitions()).toContain('reopen');
    expect(comp.availableTransitions()).toContain('complete');
  });

  it('should navigate back to procurement list', () => {
    const router = TestBed.inject(Router);
    fixture.componentInstance.backToList();
    expect(router.navigate).toHaveBeenCalledWith(['/procurement']);
  });

  it('should apply tab=lines query param to line items tab', async () => {
    TestBed.resetTestingModule();
    const getPurchaseOrder = vi.fn().mockReturnValue(
      of({ isSuccess: true as const, result: mockPo })
    );

    await TestBed.configureTestingModule({
      imports: [PurchaseOrderDetailsPageComponent, NoopAnimationsModule],
      providers: [
        MessageService,
        ConfirmationService,
        { provide: PurchaseOrdersApiService, useValue: { getPurchaseOrder } },
        {
          provide: ProductsApiService,
          useValue: {
            getProduct: vi
              .fn()
              .mockReturnValue(of({ isSuccess: false as const, result: undefined }))
          }
        },
        { provide: ActivatedRoute, useValue: activatedRouteMock({ tab: 'lines' }) },
        { provide: Router, useValue: { navigate: vi.fn().mockResolvedValue(true) } }
      ]
    }).compileComponents();

    const f = TestBed.createComponent(PurchaseOrderDetailsPageComponent);
    f.detectChanges();
    await f.whenStable();

    expect(f.componentInstance.activeTab()).toBe(1);
  });

  it('should produce empty stateTimelineEvents when stateHistory is absent', async () => {
    TestBed.resetTestingModule();
    const poNoHistory: PurchaseOrder = { ...mockPo };
    delete (poNoHistory as { stateHistory?: unknown }).stateHistory;
    const getPurchaseOrder = vi.fn().mockReturnValue(
      of({ isSuccess: true as const, result: poNoHistory })
    );

    await TestBed.configureTestingModule({
      imports: [PurchaseOrderDetailsPageComponent, NoopAnimationsModule],
      providers: [
        MessageService,
        ConfirmationService,
        { provide: PurchaseOrdersApiService, useValue: { getPurchaseOrder } },
        {
          provide: ProductsApiService,
          useValue: {
            getProduct: vi.fn().mockReturnValue(of({ isSuccess: false as const, result: undefined }))
          }
        },
        { provide: ActivatedRoute, useValue: activatedRouteMock() },
        { provide: Router, useValue: { navigate: vi.fn().mockResolvedValue(true) } }
      ]
    }).compileComponents();

    const noHistFixture = TestBed.createComponent(PurchaseOrderDetailsPageComponent);
    noHistFixture.detectChanges();
    await noHistFixture.whenStable();

    expect(noHistFixture.componentInstance.stateTimelineEvents()).toEqual([]);
    noHistFixture.componentInstance.onTabChange(2);
    expect(noHistFixture.componentInstance.activeTab()).toBe(2);
    expect(noHistFixture.componentInstance.stateTimelineEvents()).toHaveLength(0);
  });

  it('should handle empty purchaseOrderItems', async () => {
    TestBed.resetTestingModule();
    const emptyItemsPo: PurchaseOrder = { ...mockPo, purchaseOrderItems: [] };
    const getPurchaseOrder = vi.fn().mockReturnValue(
      of({ isSuccess: true as const, result: emptyItemsPo })
    );

    await TestBed.configureTestingModule({
      imports: [PurchaseOrderDetailsPageComponent, NoopAnimationsModule],
      providers: [
        MessageService,
        ConfirmationService,
        { provide: PurchaseOrdersApiService, useValue: { getPurchaseOrder } },
        {
          provide: ProductsApiService,
          useValue: {
            getProduct: vi.fn().mockReturnValue(of({ isSuccess: false as const, result: undefined }))
          }
        },
        { provide: ActivatedRoute, useValue: activatedRouteMock() },
        { provide: Router, useValue: { navigate: vi.fn().mockResolvedValue(true) } }
      ]
    }).compileComponents();

    const emptyFixture = TestBed.createComponent(PurchaseOrderDetailsPageComponent);
    emptyFixture.detectChanges();
    await emptyFixture.whenStable();

    expect(emptyFixture.componentInstance.purchaseOrder()?.purchaseOrderItems).toEqual([]);
    emptyFixture.componentInstance.onTabChange(1);
    expect(emptyFixture.componentInstance.activeTab()).toBe(1);
  });

  it('supplierLine should fall back to supplierId when supplier name is absent', () => {
    const component = fixture.componentInstance;
    const poNoSupplierName: PurchaseOrder = {
      ...mockPo,
      supplier: { id: 'sup_1', name: '' }
    };
    expect(component.supplierLine(poNoSupplierName)).toBe(mockPo.supplierId);

    const poNoSupplier: PurchaseOrder = { ...mockPo, supplier: null };
    expect(component.supplierLine(poNoSupplier)).toBe(mockPo.supplierId);
  });

  it('formatDateOrDash should return an em dash for missing or invalid dates', () => {
    const component = fixture.componentInstance;
    expect(component.formatDateOrDash(null)).toBe('—');
    expect(component.formatDateOrDash('')).toBe('—');
    expect(component.formatDateOrDash('not-a-date')).toBe('—');
  });

  it('supplierCodeLine should trim and return supplier code when present', () => {
    const component = fixture.componentInstance;
    const po: PurchaseOrder = {
      ...mockPo,
      supplier: { id: 'sup_1', name: 'Acme', supplierCode: '  SUP-01  ' }
    };
    expect(component.supplierCodeLine(po)).toBe('SUP-01');
    expect(component.supplierCodeLine({ ...mockPo, supplier: { id: 'sup_1', name: 'Acme' } })).toBeNull();
  });
});

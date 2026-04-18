import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { of } from 'rxjs';

import { ConfirmationService, MessageService } from 'primeng/api';

import { PurchaseOrderDetailsPageComponent } from './purchase-order-details-page.component';
import { PurchaseOrdersApiService } from '../../services/purchase-orders-api.service';
import type { PurchaseOrder } from '../../models/purchase-order.entity';
import { PurchaseState } from '../../enums/purchase-state.enum';
import { purchaseStateLabel } from '../../models/purchase-state.display';

describe('PurchaseOrderDetailsPageComponent', () => {
  let fixture: ComponentFixture<PurchaseOrderDetailsPageComponent>;

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

    await TestBed.configureTestingModule({
      imports: [PurchaseOrderDetailsPageComponent, NoopAnimationsModule],
      providers: [
        MessageService,
        ConfirmationService,
        { provide: PurchaseOrdersApiService, useValue: apiMock },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: convertToParamMap({ id: 'po_1' }) },
            paramMap: of(convertToParamMap({ id: 'po_1' }))
          }
        },
        { provide: Router, useValue: { navigate: vi.fn().mockResolvedValue(true) } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PurchaseOrderDetailsPageComponent);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create, load full purchase order, and surface rendered fields', () => {
    const api = TestBed.inject(PurchaseOrdersApiService);
    const component = fixture.componentInstance;
    const text = fixture.nativeElement.textContent as string;

    expect(api.getPurchaseOrder).toHaveBeenCalledWith('po_1');

    expect(component.purchaseOrder()).toEqual(mockPo);

    expect(text).toContain(mockPo.purchaseNumber);
    expect(text).toContain(purchaseStateLabel(mockPo.state));
    expect(text).toContain(component.supplierLine(mockPo));
    expect(text).toContain(mockPo.id);

    const loaded = component.purchaseOrder();
    expect(loaded?.orderDate).toBe(mockPo.orderDate);
    expect(loaded?.subTotal).toBe(mockPo.subTotal);
    expect(loaded?.taxAmount).toBe(mockPo.taxAmount);
    expect(loaded?.discountAmount).toBe(mockPo.discountAmount);
    expect(loaded?.totalAmount).toBe(mockPo.totalAmount);

    const firstLine = mockPo.purchaseOrderItems![0];
    expect(text).toContain(firstLine.id);
    expect(text).toContain(firstLine.productId);
    expect(text).toContain(String(firstLine.quantity));
    expect(text).toContain('SKU-1');

    expect(text).toContain('Edit');
    expect(text).toContain('Submit');
    expect(text).toContain('Cancel');
  });

  it('should show Reopen and Complete without Edit when order is Approved', async () => {
    TestBed.resetTestingModule();
    const approvedPo: PurchaseOrder = { ...mockPo, state: PurchaseState.Approved };
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

    await TestBed.configureTestingModule({
      imports: [PurchaseOrderDetailsPageComponent, NoopAnimationsModule],
      providers: [
        MessageService,
        ConfirmationService,
        { provide: PurchaseOrdersApiService, useValue: apiMock },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: convertToParamMap({ id: 'po_1' }) },
            paramMap: of(convertToParamMap({ id: 'po_1' }))
          }
        },
        { provide: Router, useValue: { navigate: vi.fn().mockResolvedValue(true) } }
      ]
    }).compileComponents();

    const approvedFixture = TestBed.createComponent(PurchaseOrderDetailsPageComponent);
    approvedFixture.detectChanges();
    await approvedFixture.whenStable();

    const text = (approvedFixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Reopen');
    expect(text).toContain('Complete');
    expect(text).not.toContain('Edit');
  });

  it('should navigate back to procurement list', () => {
    const router = TestBed.inject(Router);
    fixture.componentInstance.backToList();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard', 'procurement']);
  });

  it('should show no line items when purchaseOrderItems is empty', async () => {
    TestBed.resetTestingModule();
    const emptyItemsPo: PurchaseOrder = { ...mockPo, purchaseOrderItems: [] };
    const getPurchaseOrder = vi.fn().mockReturnValue(
      of({ isSuccess: true as const, result: emptyItemsPo })
    );

    await TestBed.configureTestingModule({
      imports: [PurchaseOrderDetailsPageComponent, NoopAnimationsModule],
      providers: [
        MessageService,
        { provide: PurchaseOrdersApiService, useValue: { getPurchaseOrder } },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: convertToParamMap({ id: 'po_1' }) },
            paramMap: of(convertToParamMap({ id: 'po_1' }))
          }
        },
        { provide: Router, useValue: { navigate: vi.fn().mockResolvedValue(true) } }
      ]
    }).compileComponents();

    const emptyFixture = TestBed.createComponent(PurchaseOrderDetailsPageComponent);
    emptyFixture.detectChanges();
    await emptyFixture.whenStable();

    expect((emptyFixture.nativeElement as HTMLElement).textContent).toContain('No line items.');
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
});

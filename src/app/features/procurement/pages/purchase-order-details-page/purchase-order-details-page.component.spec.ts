import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { of } from 'rxjs';

import { MessageService } from 'primeng/api';

import { PurchaseOrderDetailsPageComponent } from './purchase-order-details-page.component';
import { PurchaseOrdersApiService } from '../../services/purchase-orders-api.service';
import type { PurchaseOrder } from '../../models/purchase-order.entity';
import { PurchaseState } from '../../enums/purchase-state.enum';

describe('PurchaseOrderDetailsPageComponent', () => {
  let fixture: ComponentFixture<PurchaseOrderDetailsPageComponent>;
  const mockPo: PurchaseOrder = {
    id: 'po_1',
    createdAt: '2026-01-01T00:00:00.000Z',
    lastModifiedAt: '2026-01-01T00:00:00.000Z',
    purchaseNumber: 'PO-100',
    supplierId: 'sup_1',
    supplier: { id: 'sup_1', name: 'Acme' },
    state: PurchaseState.Approved,
    orderDate: '2026-01-10T00:00:00.000Z',
    subTotal: 100,
    taxAmount: 14,
    discountAmount: 0,
    totalAmount: 114
  };

  beforeEach(async () => {
    const getPurchaseOrder = vi.fn().mockReturnValue(
      of({ isSuccess: true as const, result: mockPo })
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

    fixture = TestBed.createComponent(PurchaseOrderDetailsPageComponent);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create and load purchase order', () => {
    const api = TestBed.inject(PurchaseOrdersApiService);
    expect(api.getPurchaseOrder).toHaveBeenCalledWith('po_1');
    expect(fixture.nativeElement.textContent).toContain('PO-100');
    expect(fixture.nativeElement.textContent).toContain('Acme');
  });

  it('should navigate back to procurement list', () => {
    const router = TestBed.inject(Router);
    fixture.componentInstance.backToList();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard', 'procurement']);
  });
});

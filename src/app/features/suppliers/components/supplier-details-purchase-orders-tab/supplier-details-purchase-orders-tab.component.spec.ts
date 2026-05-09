import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { MessageService } from 'primeng/api';

import { SupplierDetailsPurchaseOrdersTabComponent } from './supplier-details-purchase-orders-tab.component';
import { PurchaseOrdersApiService } from '../../../procurement/services/purchase-orders-api.service';

describe('SupplierDetailsPurchaseOrdersTabComponent', () => {
  let fixture: ComponentFixture<SupplierDetailsPurchaseOrdersTabComponent>;
  let listPurchaseOrders: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    listPurchaseOrders = vi.fn().mockReturnValue(
      of({
        isSuccess: true as const,
        result: {
          data: [],
          info: { length: 25, skip: 0, totalCount: 0 }
        }
      })
    );

    await TestBed.configureTestingModule({
      imports: [SupplierDetailsPurchaseOrdersTabComponent, NoopAnimationsModule],
      providers: [
        MessageService,
        { provide: PurchaseOrdersApiService, useValue: { listPurchaseOrders } },
        { provide: Router, useValue: { navigate: vi.fn().mockResolvedValue(true) } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SupplierDetailsPurchaseOrdersTabComponent);
    fixture.componentRef.setInput('supplierId', 'sup_1');
    fixture.detectChanges();
  });

  it('should request purchase orders scoped by supplier', () => {
    expect(listPurchaseOrders).toHaveBeenCalled();
    const req = listPurchaseOrders.mock.calls[0][0];
    expect(req.SupplierId).toBe('sup_1');
    expect(req.IncludePurchaseItems).toBe(false);
    expect(req.IncludeSupplier).toBe(true);
  });
});

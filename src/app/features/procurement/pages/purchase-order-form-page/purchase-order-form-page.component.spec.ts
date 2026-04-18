import { describe, it, expect, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { of } from 'rxjs';
import { MessageService } from 'primeng/api';

import { PurchaseOrderFormPageComponent } from './purchase-order-form-page.component';
import { PurchaseOrdersApiService } from '../../services/purchase-orders-api.service';
import { SuppliersApiService } from '../../../suppliers/services/suppliers-api.service';
import { ProductsApiService } from '../../../products/services/products-api.service';
import type { PurchaseOrder } from '../../models/purchase-order.entity';

describe('PurchaseOrderFormPageComponent', () => {
  it('create mode should call createPurchaseOrder on submit', async () => {
    const createPurchaseOrder = vi.fn().mockReturnValue(
      of({
        isSuccess: true as const,
        result: { id: 'po_new' } as PurchaseOrder
      })
    );

    await TestBed.configureTestingModule({
      imports: [PurchaseOrderFormPageComponent, NoopAnimationsModule],
      providers: [
        MessageService,
        {
          provide: PurchaseOrdersApiService,
          useValue: { createPurchaseOrder, getPurchaseOrder: vi.fn() }
        },
        { provide: SuppliersApiService, useValue: { searchSuppliers: vi.fn().mockReturnValue(of([])) } },
        { provide: ProductsApiService, useValue: { searchProducts: vi.fn().mockReturnValue(of([])) } },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: { mode: 'create' },
              paramMap: convertToParamMap({})
            }
          }
        },
        { provide: Router, useValue: { navigate: vi.fn().mockResolvedValue(true) } }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(PurchaseOrderFormPageComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.form.patchValue({
      supplierId: 'sup_1',
      taxAmount: 0,
      discountAmount: 0
    });
    component.items.at(0)?.patchValue({
      productId: 'prod_1',
      quantity: 1,
      unitPrice: 10
    });

    component.submit();
    await fixture.whenStable();

    expect(createPurchaseOrder).toHaveBeenCalled();
    const body = createPurchaseOrder.mock.calls[0][0];
    expect(body.SupplierId).toBe('sup_1');
    expect(body.PurchaseOrderItems).toHaveLength(1);
    expect(body.PurchaseOrderItems[0].ProductId).toBe('prod_1');
  });
});

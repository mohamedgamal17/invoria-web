import { describe, it, expect, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { MessageService } from 'primeng/api';

import { PurchaseOrderFormPageComponent } from './purchase-order-form-page.component';
import { PurchaseOrdersApiService } from '../../services/purchase-orders-api.service';
import { SuppliersApiService } from '../../../suppliers/services/suppliers-api.service';
import { ProductsApiService } from '../../../products/services/products-api.service';
import { ProductIdControlComponent } from '../../components/product-id-control/product-id-control.component';
import { PurchaseState } from '../../enums/purchase-state.enum';
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

  it('edit mode should show product name from line DTO when loading', async () => {
    const draftPo: PurchaseOrder = {
      id: 'po_1',
      purchaseNumber: 'PO-001',
      supplierId: 'sup_1',
      supplier: { id: 'sup_1', name: 'Acme Supplier' },
      state: PurchaseState.Draft,
      subTotal: 10,
      taxAmount: 0,
      discountAmount: 0,
      totalAmount: 10,
      createdAt: '',
      purchaseOrderItems: [
        {
          id: 'line_1',
          productId: 'prod_1',
          productName: 'Widget A',
          quantity: 1,
          unitPrice: 10,
          lineTotal: 10
        }
      ]
    };

    const getPurchaseOrder = vi.fn().mockReturnValue(
      of({ isSuccess: true as const, result: draftPo })
    );

    await TestBed.configureTestingModule({
      imports: [PurchaseOrderFormPageComponent, NoopAnimationsModule],
      providers: [
        MessageService,
        {
          provide: PurchaseOrdersApiService,
          useValue: { createPurchaseOrder: vi.fn(), getPurchaseOrder, updatePurchaseOrder: vi.fn() }
        },
        { provide: SuppliersApiService, useValue: { searchSuppliers: vi.fn().mockReturnValue(of([])) } },
        {
          provide: ProductsApiService,
          useValue: {
            searchProducts: vi.fn().mockReturnValue(of([])),
            getProduct: vi.fn()
          }
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: { mode: 'edit' },
              paramMap: convertToParamMap({ id: 'po_1' })
            }
          }
        },
        { provide: Router, useValue: { navigate: vi.fn().mockResolvedValue(true) } }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(PurchaseOrderFormPageComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const picker = fixture.debugElement.query(By.css('app-product-id-control'))
      .componentInstance as ProductIdControlComponent;
    expect(picker.selectedProduct()?.name).toBe('Widget A');
    expect(picker.selectedProduct()?.name).not.toBe('prod_1');
  });

  it('edit mode should resolve product name via catalog when line has no productName', async () => {
    const draftPo: PurchaseOrder = {
      id: 'po_1',
      purchaseNumber: 'PO-001',
      supplierId: 'sup_1',
      supplier: { id: 'sup_1', name: 'Acme Supplier' },
      state: PurchaseState.Draft,
      subTotal: 10,
      taxAmount: 0,
      discountAmount: 0,
      totalAmount: 10,
      createdAt: '',
      purchaseOrderItems: [
        {
          id: 'line_1',
          productId: 'prod_1',
          quantity: 1,
          unitPrice: 10,
          lineTotal: 10
        }
      ]
    };

    const getPurchaseOrder = vi.fn().mockReturnValue(
      of({ isSuccess: true as const, result: draftPo })
    );
    const getProduct = vi.fn().mockReturnValue(
      of({
        isSuccess: true as const,
        result: {
          id: 'prod_1',
          name: 'Catalog Widget',
          price: 10,
          stock: { actualQuantity: 0, reservedQuantity: 0 },
          createdAt: ''
        }
      })
    );

    await TestBed.configureTestingModule({
      imports: [PurchaseOrderFormPageComponent, NoopAnimationsModule],
      providers: [
        MessageService,
        {
          provide: PurchaseOrdersApiService,
          useValue: { createPurchaseOrder: vi.fn(), getPurchaseOrder, updatePurchaseOrder: vi.fn() }
        },
        { provide: SuppliersApiService, useValue: { searchSuppliers: vi.fn().mockReturnValue(of([])) } },
        {
          provide: ProductsApiService,
          useValue: {
            searchProducts: vi.fn().mockReturnValue(of([])),
            getProduct
          }
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: { mode: 'edit' },
              paramMap: convertToParamMap({ id: 'po_1' })
            }
          }
        },
        { provide: Router, useValue: { navigate: vi.fn().mockResolvedValue(true) } }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(PurchaseOrderFormPageComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(getProduct).toHaveBeenCalledWith('prod_1');
    const picker = fixture.debugElement.query(By.css('app-product-id-control'))
      .componentInstance as ProductIdControlComponent;
    expect(picker.selectedProduct()?.name).toBe('Catalog Widget');
  });
});

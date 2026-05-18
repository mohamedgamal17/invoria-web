import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { of } from 'rxjs';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

import { PurchaseOrderFormPageComponent } from './purchase-order-form-page.component';
import { PurchaseOrdersApiService } from '../../services/purchase-orders-api.service';
import { SuppliersApiService } from '../../../suppliers/services/suppliers-api.service';
import { ProductsApiService } from '../../../products/services/products-api.service';
import { PurchaseState } from '../../enums/purchase-state.enum';
import type { PurchaseOrder } from '../../models/purchase-order.entity';

describe('PurchaseOrderFormPageComponent', () => {
  let fixture: ComponentFixture<PurchaseOrderFormPageComponent>;
  let component: PurchaseOrderFormPageComponent;
  let createPurchaseOrder: ReturnType<typeof vi.fn>;
  let getPurchaseOrder: ReturnType<typeof vi.fn>;
  let searchProducts: ReturnType<typeof vi.fn>;
  let getProduct: ReturnType<typeof vi.fn>;

  async function setup(
    opts: { mode: 'create' | 'edit'; id?: string },
    mocks?: { getPurchaseOrder?: ReturnType<typeof vi.fn>; getProduct?: ReturnType<typeof vi.fn> }
  ) {
    TestBed.resetTestingModule();
    createPurchaseOrder = vi.fn().mockReturnValue(
      of({
        isSuccess: true as const,
        result: { id: 'po_new' } as PurchaseOrder
      })
    );
    getPurchaseOrder = mocks?.getPurchaseOrder ?? vi.fn();
    searchProducts = vi.fn().mockReturnValue(of([]));
    getProduct = mocks?.getProduct ?? vi.fn();

    const snapshot =
      opts.mode === 'edit' && opts.id
        ? {
            data: { mode: 'edit' },
            paramMap: convertToParamMap({ id: opts.id })
          }
        : {
            data: { mode: 'create' },
            paramMap: convertToParamMap({})
          };

    await TestBed.configureTestingModule({
      imports: [PurchaseOrderFormPageComponent, NoopAnimationsModule],
      providers: [
        MessageService,
        {
          provide: PurchaseOrdersApiService,
          useValue: {
            createPurchaseOrder,
            getPurchaseOrder,
            updatePurchaseOrder: vi.fn()
          }
        },
        { provide: SuppliersApiService, useValue: { searchSuppliers: vi.fn().mockReturnValue(of([])) } },
        {
          provide: ProductsApiService,
          useValue: { searchProducts, getProduct }
        },
        { provide: ActivatedRoute, useValue: { snapshot } },
        { provide: Router, useValue: { navigate: vi.fn().mockResolvedValue(true) } }
      ]
    })
      .overrideComponent(PurchaseOrderFormPageComponent, {
        set: {
          template: '<section></section>',
          imports: [CommonModule, ButtonModule, CardModule]
        }
      })
      .compileComponents();

    fixture = TestBed.createComponent(PurchaseOrderFormPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  }

  beforeEach(async () => {
    await setup({ mode: 'create' });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('reuses cached products when the same query is searched again', async () => {
    vi.useFakeTimers();
    const widget = {
      id: 'p1',
      name: 'Widget',
      price: 10,
      stock: { actualQuantity: 0, reservedQuantity: 0 },
      createdAt: ''
    };
    searchProducts.mockImplementation((_: unknown, query: string) =>
      of(query === 'ab' ? [widget] : [])
    );

    component.searchProducts({ query: 'ab' });
    await vi.advanceTimersByTimeAsync(700);
    expect(searchProducts).toHaveBeenCalledTimes(1);
    expect(component.products()).toEqual([widget]);

    component.searchProducts({ query: 'ab' });
    await vi.advanceTimersByTimeAsync(700);
    expect(searchProducts).toHaveBeenCalledTimes(1);
    expect(component.products()).toEqual([widget]);
  });

  it('create mode should call createPurchaseOrder on submit', () => {
    component.supplierId.set('sup_1');
    component.taxAmount.set(0);
    component.discountAmount.set(0);
    component.draftItems.set([
      {
        productId: 'prod_1',
        productName: 'Widget',
        quantity: 1,
        unitPrice: 10,
        supplierProductCode: null
      }
    ]);

    component.submit();

    expect(createPurchaseOrder).toHaveBeenCalled();
    const body = createPurchaseOrder.mock.calls[0][0];
    expect(body.SupplierId).toBe('sup_1');
    expect(body.PurchaseOrderItems).toHaveLength(1);
    expect(body.PurchaseOrderItems[0].ProductId).toBe('prod_1');
    expect(body.PurchaseOrderItems[0].SupplierProductCode).toBeNull();
  });

  it('create mode should not submit when unit price is zero', () => {
    component.supplierId.set('sup_1');
    component.draftItems.set([
      {
        productId: 'prod_1',
        productName: 'Widget',
        quantity: 1,
        unitPrice: 0,
        supplierProductCode: null
      }
    ]);

    component.submit();

    expect(createPurchaseOrder).not.toHaveBeenCalled();
  });

  it('create mode should not submit when quantity is zero', () => {
    component.supplierId.set('sup_1');
    component.draftItems.set([
      {
        productId: 'prod_1',
        productName: 'Widget',
        quantity: 0,
        unitPrice: 10,
        supplierProductCode: null
      }
    ]);

    component.submit();

    expect(createPurchaseOrder).not.toHaveBeenCalled();
  });

  it('addItem merges quantity when product already in draft', () => {
    component.draftItems.set([
      {
        productId: 'prod_1',
        productName: 'Widget',
        quantity: 2,
        unitPrice: 10,
        supplierProductCode: null
      }
    ]);
    component.selectedProduct.set({
      id: 'prod_1',
      name: 'Widget',
      price: 10,
      stock: { actualQuantity: 0, reservedQuantity: 0 },
      createdAt: ''
    });
    component.itemQuantity.set(3);
    component.itemUnitPrice.set(10);

    component.addItem();

    expect(component.draftItems()).toHaveLength(1);
    expect(component.draftItems()[0].quantity).toBe(5);
  });

  it('edit mode should load product name from line DTO', async () => {
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

    await setup(
      { mode: 'edit', id: 'po_1' },
      {
        getPurchaseOrder: vi.fn().mockReturnValue(of({ isSuccess: true as const, result: draftPo }))
      }
    );

    expect(component.draftItems()[0].productName).toBe('Widget A');
    expect(getProduct).not.toHaveBeenCalled();
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

    await setup(
      { mode: 'edit', id: 'po_1' },
      {
        getPurchaseOrder: vi.fn().mockReturnValue(of({ isSuccess: true as const, result: draftPo })),
        getProduct: vi.fn().mockReturnValue(
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
        )
      }
    );
    await fixture.whenStable();
    fixture.detectChanges();

    expect(getProduct).toHaveBeenCalledWith('prod_1');
    expect(component.draftItems()[0].productName).toBe('Catalog Widget');
  });
});

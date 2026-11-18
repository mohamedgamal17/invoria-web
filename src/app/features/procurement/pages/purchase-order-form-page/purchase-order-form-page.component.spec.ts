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
  let searchSuppliers: ReturnType<typeof vi.fn>;

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
    searchSuppliers = vi.fn().mockReturnValue(of([]));

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
        { provide: SuppliersApiService, useValue: { searchSuppliers } },
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

  it('create mode should call createPurchaseOrder with the validated form payload', () => {
    component.submit({
      supplierId: 'sup_1',
      items: [
        {
          productId: 'prod_1',
          productName: 'Widget',
          quantity: 1,
          unitPrice: 10
        }
      ]
    });

    expect(createPurchaseOrder).toHaveBeenCalled();
    const body = createPurchaseOrder.mock.calls[0][0];
    expect(body.supplierId).toBe('sup_1');
    expect(body.purchaseOrderItems).toHaveLength(1);
    expect(body.purchaseOrderItems[0].productId).toBe('prod_1');
    expect(body).toEqual({
      supplierId: 'sup_1',
      purchaseOrderItems: [{ productId: 'prod_1', quantity: 1, unitPrice: 10 }]
    });
  });

  it('create mode should not call the API without a supplier id', () => {
    component.submit({
      supplierId: '  ',
      items: [{ productId: 'prod_1', productName: 'Widget', quantity: 1, unitPrice: 10 }]
    });

    expect(createPurchaseOrder).not.toHaveBeenCalled();
  });

  it('reuses cached suppliers when the same query is searched again', async () => {
    vi.useFakeTimers();
    const acme = { id: 'sup_1', name: 'Acme Supplies' };
    searchSuppliers.mockImplementation((_: unknown, query: string) =>
      of(query === 'ac' ? [acme] : [])
    );

    component.searchSuppliers({ query: 'ac' });
    await vi.advanceTimersByTimeAsync(700);
    expect(searchSuppliers).toHaveBeenCalledTimes(1);
    expect(component.suppliers()).toEqual([acme]);

    component.searchSuppliers({ query: 'ac' });
    await vi.advanceTimersByTimeAsync(700);
    expect(searchSuppliers).toHaveBeenCalledTimes(1);
    expect(component.suppliers()).toEqual([acme]);
  });

  it('answers a repeated supplier query from the cache synchronously', () => {
    vi.useFakeTimers();
    const acme = { id: 'sup_1', name: 'Acme Supplies' };
    searchSuppliers.mockReturnValue(of([acme]));

    component.searchSuppliers({ query: '' });
    expect(component.suppliers()).toEqual([]);

    vi.advanceTimersByTime(700);
    expect(searchSuppliers).toHaveBeenCalledTimes(1);
    expect(component.suppliers()).toEqual([acme]);

    component.searchSuppliers({ query: '' });
    expect(component.suppliers()).toEqual([acme]);
  });

  it('trims the supplier query before searching', async () => {
    vi.useFakeTimers();
    const acme = { id: 'sup_1', name: 'Acme Supplies' };
    searchSuppliers.mockImplementation((_: unknown, query: string) =>
      of(query === 'ac' ? [acme] : [])
    );

    component.searchSuppliers({ query: '  ac  ' });
    await vi.advanceTimersByTimeAsync(700);

    expect(searchSuppliers).toHaveBeenCalledWith(expect.anything(), 'ac');
    expect(component.suppliers()).toEqual([acme]);
  });

  it('edit mode should load product name from line DTO', async () => {
    const draftPo: PurchaseOrder = {
      id: 'po_1',
      purchaseNumber: 'PO-001',
      supplierId: 'sup_1',
      supplier: { id: 'sup_1', name: 'Acme Supplier' },
      state: PurchaseState.Draft,
      subTotal: 10,
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

    expect(component.initialItems()[0].productName).toBe('Widget A');
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
    expect(component.initialItems()[0].productName).toBe('Catalog Widget');
  });
});

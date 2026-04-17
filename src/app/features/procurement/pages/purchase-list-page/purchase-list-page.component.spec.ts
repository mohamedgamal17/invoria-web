import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';

import { MessageService } from 'primeng/api';

import { PurchaseListPageComponent } from './purchase-list-page.component';
import { PurchaseOrdersApiService } from '../../services/purchase-orders-api.service';
import type { PurchaseOrder } from '../../models/purchase-order.entity';
import { PurchaseState } from '../../enums/purchase-state.enum';

describe('PurchaseListPageComponent', () => {
  let component: PurchaseListPageComponent;
  let fixture: ComponentFixture<PurchaseListPageComponent>;
  let mockApi: { listPurchaseOrders: ReturnType<typeof vi.fn> };

  const basePo = (id: string, purchaseNumber: string): PurchaseOrder => ({
    id,
    createdAt: '2026-01-01T00:00:00.000Z',
    lastModifiedAt: '2026-01-01T00:00:00.000Z',
    purchaseNumber,
    supplierId: 'sup_1',
    supplier: { id: 'sup_1', name: 'Acme Supplies' },
    state: PurchaseState.Draft,
    orderDate: '2026-01-15T00:00:00.000Z',
    subTotal: 100,
    taxAmount: 14,
    discountAmount: 0,
    totalAmount: 114
  });

  const successResponse = (data: PurchaseOrder[], totalCount: number) => ({
    isSuccess: true as const,
    result: {
      data,
      info: { length: data.length || 25, skip: 0, totalCount }
    }
  });

  function setup(paramMap$: BehaviorSubject<ReturnType<typeof convertToParamMap>>) {
    TestBed.resetTestingModule();
    mockApi = {
      listPurchaseOrders: vi.fn().mockReturnValue(of(successResponse([basePo('po_1', 'PO-001')], 1)))
    };

    TestBed.configureTestingModule({
      imports: [PurchaseListPageComponent, NoopAnimationsModule],
      providers: [
        MessageService,
        { provide: PurchaseOrdersApiService, useValue: mockApi },
        {
          provide: ActivatedRoute,
          useValue: { queryParamMap: paramMap$.asObservable() }
        },
        {
          provide: Router,
          useValue: { navigate: vi.fn().mockResolvedValue(true) }
        }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });

    fixture = TestBed.createComponent(PurchaseListPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(() => {
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    const paramMap$ = new BehaviorSubject(convertToParamMap({ page: '1', pageSize: '25' }));
    setup(paramMap$);
  });

  it('should create and request first page with expected list payload', () => {
    expect(component).toBeTruthy();
    expect(mockApi.listPurchaseOrders).toHaveBeenCalledWith({
      Skip: 0,
      Length: 25,
      IncludePurchaseItems: false,
      IncludeSupplier: true
    });
    expect(component.displayPurchaseOrders().length).toBe(1);
    expect(component.displayPurchaseOrders()[0].purchaseNumber).toBe('PO-001');
    expect(component.displayPaging().totalCount).toBe(1);
  });

  it('should map Skip for page 2 from query params', () => {
    const paramMap$ = new BehaviorSubject(convertToParamMap({ page: '2', pageSize: '25' }));
    setup(paramMap$);

    expect(mockApi.listPurchaseOrders).toHaveBeenCalledWith({
      Skip: 25,
      Length: 25,
      IncludePurchaseItems: false,
      IncludeSupplier: true
    });
  });

  it('should toast and clear rows when API returns failure', async () => {
    TestBed.resetTestingModule();
    const paramMap$ = new BehaviorSubject(convertToParamMap({ page: '1', pageSize: '25' }));
    const failApi = {
      listPurchaseOrders: vi
        .fn()
        .mockReturnValue(of({ isSuccess: false as const, error: { message: 'Server error' } }))
    };

    TestBed.configureTestingModule({
      imports: [PurchaseListPageComponent, NoopAnimationsModule],
      providers: [
        MessageService,
        { provide: PurchaseOrdersApiService, useValue: failApi },
        {
          provide: ActivatedRoute,
          useValue: { queryParamMap: paramMap$.asObservable() }
        },
        {
          provide: Router,
          useValue: { navigate: vi.fn().mockResolvedValue(true) }
        }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });

    const failFixture = TestBed.createComponent(PurchaseListPageComponent);
    const msg = failFixture.debugElement.injector.get(MessageService);
    const addSpy = vi.spyOn(msg, 'add');
    const failComponent = failFixture.componentInstance;
    failFixture.detectChanges();
    await failFixture.whenStable();

    expect(failApi.listPurchaseOrders).toHaveBeenCalled();
    expect(addSpy).toHaveBeenCalled();
    expect(failComponent.displayPurchaseOrders().length).toBe(0);
    expect(failComponent.displayPaging().totalCount).toBe(0);
  });

  it('should update query params on page change', () => {
    const router = TestBed.inject(Router);
    component.onPageChange({ first: 25, rows: 25 });
    expect(router.navigate).toHaveBeenCalledWith(
      [],
      expect.objectContaining({
        queryParams: { page: 2, pageSize: 25 },
        queryParamsHandling: 'merge'
      })
    );
  });

  it('should navigate to purchase order detail on goToDetails', () => {
    const router = TestBed.inject(Router);
    const route = TestBed.inject(ActivatedRoute);
    const po = component.displayPurchaseOrders()[0];
    component.goToDetails(po);
    expect(router.navigate).toHaveBeenCalledWith([po.id], { relativeTo: route });
  });
});

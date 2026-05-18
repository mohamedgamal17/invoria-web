import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { environment } from '../../../../environments/environment';
import type { CreatePurchaseOrderRequest } from '../models/create-purchase-order.request';
import { PurchaseOrdersApiService } from './purchase-orders-api.service';

describe('PurchaseOrdersApiService', () => {
  let service: PurchaseOrdersApiService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.apiUrl.replace(/\/?$/, '/')}`;

  const validBody: CreatePurchaseOrderRequest = {
    SupplierId: 'sup_1',
    TaxAmount: 0,
    DiscountAmount: 0,
    PurchaseOrderItems: [
      {
        ProductId: 'prod_1',
        Quantity: 1,
        UnitPrice: 10,
        SupplierProductCode: null
      }
    ]
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PurchaseOrdersApiService, provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(PurchaseOrdersApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('createPurchaseOrder', () => {
    it('throws when SupplierId missing', () => {
      expect(() =>
        service.createPurchaseOrder({
          ...validBody,
          SupplierId: '   '
        })
      ).toThrow('SupplierId is required.');
    });

    it('throws when PurchaseOrderItems empty', () => {
      expect(() =>
        service.createPurchaseOrder({
          ...validBody,
          PurchaseOrderItems: []
        })
      ).toThrow('At least one purchase order line item is required.');
    });

    it('throws when ProductId missing on line', () => {
      expect(() =>
        service.createPurchaseOrder({
          ...validBody,
          PurchaseOrderItems: [{ ProductId: '', Quantity: 1, UnitPrice: 10 }]
        })
      ).toThrow('ProductId is required for each line item.');
    });

    it('throws when Quantity is not positive', () => {
      expect(() =>
        service.createPurchaseOrder({
          ...validBody,
          PurchaseOrderItems: [{ ProductId: 'prod_1', Quantity: 0, UnitPrice: 10 }]
        })
      ).toThrow('Quantity must be a positive integer.');
    });

    it('throws when UnitPrice is zero', () => {
      expect(() =>
        service.createPurchaseOrder({
          ...validBody,
          PurchaseOrderItems: [{ ProductId: 'prod_1', Quantity: 1, UnitPrice: 0 }]
        })
      ).toThrow('UnitPrice must be greater than zero.');
    });

    it('throws when UnitPrice is negative', () => {
      expect(() =>
        service.createPurchaseOrder({
          ...validBody,
          PurchaseOrderItems: [{ ProductId: 'prod_1', Quantity: 1, UnitPrice: -1 }]
        })
      ).toThrow('UnitPrice must be greater than zero.');
    });

    it('POSTs body when line item is valid with optional supplier code omitted', () => {
      service.createPurchaseOrder(validBody).subscribe();
      const req = httpMock.expectOne(`${baseUrl}purchase-orders`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(validBody);
      req.flush({ isSuccess: true, result: null });
    });

    it('POSTs body when SupplierProductCode is set', () => {
      const body: CreatePurchaseOrderRequest = {
        ...validBody,
        PurchaseOrderItems: [
          {
            ProductId: 'prod_1',
            Quantity: 2,
            UnitPrice: 5.5,
            SupplierProductCode: 'SKU-1'
          }
        ]
      };
      service.createPurchaseOrder(body).subscribe();
      const req = httpMock.expectOne(`${baseUrl}purchase-orders`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(body);
      req.flush({ isSuccess: true, result: null });
    });
  });

  describe('updatePurchaseOrder', () => {
    it('throws when UnitPrice is zero', () => {
      expect(() =>
        service.updatePurchaseOrder('po_1', {
          ...validBody,
          PurchaseOrderItems: [{ ProductId: 'prod_1', Quantity: 1, UnitPrice: 0 }]
        })
      ).toThrow('UnitPrice must be greater than zero.');
    });
  });
});

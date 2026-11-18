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
    supplierId: 'sup_1',
    purchaseOrderItems: [
      {
        productId: 'prod_1',
        quantity: 1,
        unitPrice: 10
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
          supplierId: '   '
        })
      ).toThrow('SupplierId is required.');
    });

    it('throws when PurchaseOrderItems empty', () => {
      expect(() =>
        service.createPurchaseOrder({
          ...validBody,
          purchaseOrderItems: []
        })
      ).toThrow('At least one purchase order line item is required.');
    });

    it('throws when ProductId missing on line', () => {
      expect(() =>
        service.createPurchaseOrder({
          ...validBody,
          purchaseOrderItems: [{ productId: '', quantity: 1, unitPrice: 10 }]
        })
      ).toThrow('ProductId is required for each line item.');
    });

    it('throws when Quantity is not positive', () => {
      expect(() =>
        service.createPurchaseOrder({
          ...validBody,
          purchaseOrderItems: [{ productId: 'prod_1', quantity: 0, unitPrice: 10 }]
        })
      ).toThrow('Quantity must be a positive integer.');
    });

    it('throws when UnitPrice is zero', () => {
      expect(() =>
        service.createPurchaseOrder({
          ...validBody,
          purchaseOrderItems: [{ productId: 'prod_1', quantity: 1, unitPrice: 0 }]
        })
      ).toThrow('UnitPrice must be greater than zero.');
    });

    it('throws when UnitPrice is negative', () => {
      expect(() =>
        service.createPurchaseOrder({
          ...validBody,
          purchaseOrderItems: [{ productId: 'prod_1', quantity: 1, unitPrice: -1 }]
        })
      ).toThrow('UnitPrice must be greater than zero.');
    });

    it('POSTs body when line item is valid', () => {
      service.createPurchaseOrder(validBody).subscribe();
      const req = httpMock.expectOne(`${baseUrl}purchase-orders`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(validBody);
      req.flush({ isSuccess: true, result: null });
    });
  });

  describe('updatePurchaseOrder', () => {
    it('throws when UnitPrice is zero', () => {
      expect(() =>
        service.updatePurchaseOrder('po_1', {
          ...validBody,
          purchaseOrderItems: [{ productId: 'prod_1', quantity: 1, unitPrice: 0 }]
        })
      ).toThrow('UnitPrice must be greater than zero.');
    });
  });
});

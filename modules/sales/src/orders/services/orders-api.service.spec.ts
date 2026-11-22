import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { OrderPaymentMethod, PaymentType } from '../models/order-payment.enums';
import { OrdersApiService } from './orders-api.service';

describe('OrdersApiService', () => {
  let service: OrdersApiService;
  let httpMock: HttpTestingController;
  const baseUrl = 'http://localhost:5000/';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OrdersApiService, provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(OrdersApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('listOrders', () => {
    it('rejects when Skip is invalid', async () => {
      await expect(
        firstValueFrom(
          service.listOrders({
            skip: -1,
            length: 10,
            includeOrderItems: false
          })
        )
      ).rejects.toThrow('Invalid Skip.');
    });

    it('rejects when Length is invalid', async () => {
      await expect(
        firstValueFrom(
          service.listOrders({
            skip: 0,
            length: 0,
            includeOrderItems: false
          })
        )
      ).rejects.toThrow('Invalid Length.');
    });

    it('GETs orders with query params', () => {
      service
        .listOrders({
          skip: 0,
          length: 25,
          includeOrderItems: true,
          orderNumber: 'ORD-1',
          status: 5
        })
        .subscribe();

      const req = httpMock.expectOne((request) => request.url === `${baseUrl}orders`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('skip')).toBe('0');
      expect(req.request.params.get('length')).toBe('25');
      expect(req.request.params.get('includeOrderItems')).toBe('true');
      expect(req.request.params.get('orderNumber')).toBe('ORD-1');
      expect(req.request.params.get('status')).toBe('5');
      req.flush({ isSuccess: true, result: { data: [], info: { length: 25, skip: 0, totalCount: 0 } } });
    });
  });

  describe('getOrder', () => {
    it('GETs encoded order id', () => {
      service.getOrder('x/y').subscribe();
      const req = httpMock.expectOne(`${baseUrl}orders/x%2Fy`);
      expect(req.request.method).toBe('GET');
      req.flush({ isSuccess: true, result: null });
    });
  });

  describe('createOrder', () => {
    const validBody = {
      customerId: 'c1',
      items: [{ productId: 'p1', quantity: 1, price: 10 }],
      paymentType: PaymentType.Immediate
    };

    it('throws when CustomerId missing', () => {
      expect(() =>
        service.createOrder({
          customerId: '   ',
          items: validBody.items
        })
      ).toThrow('CustomerId is required.');
    });

    it('throws when Items empty', () => {
      expect(() =>
        service.createOrder({
          customerId: 'c1',
          items: []
        })
      ).toThrow('At least one line item is required.');
    });

    it('throws when line item invalid', () => {
      expect(() =>
        service.createOrder({
          customerId: 'c1',
          items: [{ productId: '', quantity: 1, price: 1 }]
        })
      ).toThrow('ProductId is required for each line item.');
    });

    it('POSTs body to orders', () => {
      service.createOrder(validBody).subscribe();
      const req = httpMock.expectOne(`${baseUrl}orders`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(validBody);
      req.flush({ isSuccess: true, result: null });
    });
  });

  describe('updateOrderItems', () => {
    it('rejects when Items missing', async () => {
      await expect(
        firstValueFrom(service.updateOrderItems('id1', { items: [] }))
      ).rejects.toThrow('Items is required.');
    });

    it('PUTs body to orders/:id', () => {
      const body = { items: [{ productId: 'p1', quantity: 2, price: 5 }] };
      service.updateOrderItems('ord_1', body).subscribe();
      const req = httpMock.expectOne(`${baseUrl}orders/ord_1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(body);
      req.flush({ isSuccess: true, result: null });
    });
  });

  describe('recordOrderPayment', () => {
    it('throws when PaidAmount invalid', () => {
      expect(() =>
        service.recordOrderPayment('o1', {
          paidAmount: 0,
          paymentMethod: OrderPaymentMethod.Cash
        })
      ).toThrow('PaidAmount must be a positive number.');
    });

    it('throws when PaymentMethod invalid', () => {
      expect(() =>
        service.recordOrderPayment('o1', {
          paidAmount: 10,
          paymentMethod: 999 as OrderPaymentMethod
        })
      ).toThrow('PaymentMethod is invalid.');
    });

    it('POSTs to orders/:id/payments', () => {
      const body = { paidAmount: 25, paymentMethod: OrderPaymentMethod.BankTransfer };
      service.recordOrderPayment('o1', body).subscribe();
      const req = httpMock.expectOne(`${baseUrl}orders/o1/payments`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(body);
      req.flush({ isSuccess: true, result: null });
    });
  });

  it('acceptOrder POSTs to orders/:id/accept', () => {
    service.acceptOrder('ord_x').subscribe();
    const req = httpMock.expectOne(`${baseUrl}orders/ord_x/accept`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({});
    req.flush({ isSuccess: true, result: null });
  });

  it('requestRevisionOrder POSTs to orders/:id/request-revision', () => {
    service.requestRevisionOrder('ord_x').subscribe();
    const req = httpMock.expectOne(`${baseUrl}orders/ord_x/request-revision`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({});
    req.flush({ isSuccess: true, result: null });
  });

  it('cancelOrder POSTs to orders/:id/cancel', () => {
    service.cancelOrder('ord_x').subscribe();
    const req = httpMock.expectOne(`${baseUrl}orders/ord_x/cancel`);
    expect(req.request.method).toBe('POST');
    req.flush({ isSuccess: true, result: null });
  });

  it('completeOrder POSTs to orders/:id/complete', () => {
    service.completeOrder('ord_x').subscribe();
    const req = httpMock.expectOne(`${baseUrl}orders/ord_x/complete`);
    expect(req.request.method).toBe('POST');
    req.flush({ isSuccess: true, result: null });
  });

  describe('addReturnItems', () => {
    it('rejects when Items missing', () => {
      expect(() => service.addReturnItems('id1', { items: [] })).toThrow(
        'At least one return line is required.'
      );
    });

    it('rejects when OrderItemId missing', () => {
      expect(() =>
        service.addReturnItems('id1', {
          items: [{ orderItemId: '  ', quantity: 1 }]
        })
      ).toThrow('OrderItemId is required for each return line.');
    });

    it('rejects when Quantity invalid', () => {
      expect(() =>
        service.addReturnItems('id1', {
          items: [{ orderItemId: 'line-1', quantity: 0 }]
        })
      ).toThrow('Return quantity must be a positive integer.');
    });

    it('PUTs body to orders/:id/return-items', () => {
      const body = { items: [{ orderItemId: 'line-1', quantity: 2 }] };
      service.addReturnItems('ord_1', body).subscribe();
      const req = httpMock.expectOne(`${baseUrl}orders/ord_1/return-items`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(body);
      req.flush({ isSuccess: true, result: null });
    });
  });
});

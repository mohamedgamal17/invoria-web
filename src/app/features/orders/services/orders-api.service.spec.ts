import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { OrderPaymentMethod, PaymentType } from '../models/order-payment.enums';
import { OrdersApiService } from './orders-api.service';

describe('OrdersApiService', () => {
  let service: OrdersApiService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.apiUrl.replace(/\/?$/, '/')}`;

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
            Skip: -1,
            Length: 10,
            IncludeOrderItems: false
          })
        )
      ).rejects.toThrow('Invalid Skip.');
    });

    it('rejects when Length is invalid', async () => {
      await expect(
        firstValueFrom(
          service.listOrders({
            Skip: 0,
            Length: 0,
            IncludeOrderItems: false
          })
        )
      ).rejects.toThrow('Invalid Length.');
    });

    it('GETs orders with query params', () => {
      service
        .listOrders({
          Skip: 0,
          Length: 25,
          IncludeOrderItems: true,
          OrderNumber: 'ORD-1',
          Status: 5
        })
        .subscribe();

      const req = httpMock.expectOne((r) => r.url === `${baseUrl}orders`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('Skip')).toBe('0');
      expect(req.request.params.get('Length')).toBe('25');
      expect(req.request.params.get('IncludeOrderItems')).toBe('true');
      expect(req.request.params.get('OrderNumber')).toBe('ORD-1');
      expect(req.request.params.get('Status')).toBe('5');
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
      CustomerId: 'c1',
      Items: [{ ProductId: 'p1', Quantity: 1, Price: 10 }],
      PaymentType: PaymentType.Immediate
    };

    it('throws when CustomerId missing', () => {
      expect(() =>
        service.createOrder({
          CustomerId: '   ',
          Items: validBody.Items
        })
      ).toThrow('CustomerId is required.');
    });

    it('throws when Items empty', () => {
      expect(() =>
        service.createOrder({
          CustomerId: 'c1',
          Items: []
        })
      ).toThrow('At least one line item is required.');
    });

    it('throws when line item invalid', () => {
      expect(() =>
        service.createOrder({
          CustomerId: 'c1',
          Items: [{ ProductId: '', Quantity: 1, Price: 1 }]
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
        firstValueFrom(service.updateOrderItems('id1', { Items: [] }))
      ).rejects.toThrow('Items is required.');
    });

    it('PUTs body to orders/:id', () => {
      const body = { Items: [{ ProductId: 'p1', Quantity: 2, Price: 5 }] };
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
          PaidAmount: 0,
          PaymentMethod: OrderPaymentMethod.Cash
        })
      ).toThrow('PaidAmount must be a positive number.');
    });

    it('throws when PaymentMethod invalid', () => {
      expect(() =>
        service.recordOrderPayment('o1', {
          PaidAmount: 10,
          PaymentMethod: 999 as OrderPaymentMethod
        })
      ).toThrow('PaymentMethod is invalid.');
    });

    it('POSTs to orders/:id/payments', () => {
      const body = { PaidAmount: 25, PaymentMethod: OrderPaymentMethod.BankTransfer };
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

  it('dispatchOrder POSTs to orders/:id/dispatch', () => {
    service.dispatchOrder('ord_x').subscribe();
    const req = httpMock.expectOne(`${baseUrl}orders/ord_x/dispatch`);
    expect(req.request.method).toBe('POST');
    req.flush({ isSuccess: true, result: null });
  });

  it('refuseOrder POSTs to orders/:id/refuse', () => {
    service.refuseOrder('ord_x').subscribe();
    const req = httpMock.expectOne(`${baseUrl}orders/ord_x/refuse`);
    expect(req.request.method).toBe('POST');
    req.flush({ isSuccess: true, result: null });
  });

  it('reopenOrder POSTs to orders/:id/reopen', () => {
    service.reopenOrder('ord_x').subscribe();
    const req = httpMock.expectOne(`${baseUrl}orders/ord_x/reopen`);
    expect(req.request.method).toBe('POST');
    req.flush({ isSuccess: true, result: null });
  });
});

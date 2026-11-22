import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { PayablesApiService } from './payables-api.service';

describe('PayablesApiService', () => {
  let service: PayablesApiService;
  let httpMock: HttpTestingController;
  const baseUrl = 'http://localhost:5000/';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PayablesApiService, provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(PayablesApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('getPayable requests GET payables/:id', () => {
    service.getPayable('pay_1').subscribe();
    const req = httpMock.expectOne(`${baseUrl}payables/pay_1`);
    expect(req.request.method).toBe('GET');
    req.flush({ isSuccess: true, result: null });
  });

  it('getPayableByPurchaseOrderId requests GET payables/by-purchase-order/:id', () => {
    service.getPayableByPurchaseOrderId('po_1').subscribe();
    const req = httpMock.expectOne(`${baseUrl}payables/by-purchase-order/po_1`);
    expect(req.request.method).toBe('GET');
    req.flush({ isSuccess: true, result: null });
  });

  it('listPayables builds Skip/Length params and skips empty filters', () => {
    service
      .listPayables({ skip: 25, length: 50, partyId: '', sourceId: undefined, isPaid: null })
      .subscribe();

    const req = httpMock.expectOne(
      (request) => request.url === `${baseUrl}payables` && request.params.get('partyId') === null
    );
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('skip')).toBe('25');
    expect(req.request.params.get('length')).toBe('50');
    expect(req.request.params.get('isPaid')).toBe(null);
    req.flush({ isSuccess: true, result: null });
  });

  it('listPayables sends IsPaid when provided', () => {
    service.listPayables({ skip: 0, length: 25, isPaid: true }).subscribe();

    const req = httpMock.expectOne((request) => request.url === `${baseUrl}payables`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('isPaid')).toBe('true');
    req.flush({ isSuccess: true, result: null });
  });

  it('listPayables throws on invalid paging', () => {
    let error: unknown;
    service.listPayables({ skip: -1, length: 25 }).subscribe({ error: (err) => (error = err) });
    expect(String(error)).toContain('Invalid Skip.');

    let lengthError: unknown;
    service.listPayables({ skip: 0, length: 0 }).subscribe({ error: (err) => (lengthError = err) });
    expect(String(lengthError)).toContain('Invalid Length.');
  });

  it('settlePayable posts body to payables/:id/settle', () => {
    service.settlePayable('pay_1', { amount: 12.5 }).subscribe();
    const req = httpMock.expectOne(`${baseUrl}payables/pay_1/settle`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ amount: 12.5 });
    req.flush({ isSuccess: true, result: null });
  });

  it('settlePayable throws on invalid id or amount', () => {
    let error: unknown;
    service.settlePayable('   ', { amount: 1 }).subscribe({ error: (err) => (error = err) });
    expect(String(error)).toContain('Invalid payable id.');

    let amountError: unknown;
    service.settlePayable('pay_1', { amount: 0 }).subscribe({ error: (err) => (amountError = err) });
    expect(String(amountError)).toContain('Invalid settlement amount.');
  });
});

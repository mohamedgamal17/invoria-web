import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { environment } from '../../../../environments/environment';
import { PayablesApiService } from './payables-api.service';

describe('PayablesApiService', () => {
  let service: PayablesApiService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.apiUrl.replace(/\/?$/, '/')}`;

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
      .listPayables({ Skip: 25, Length: 50, PartyId: '', SourceId: undefined, IsPaid: null })
      .subscribe();

    const req = httpMock.expectOne(
      (r) => r.url === `${baseUrl}payables` && r.params.get('PartyId') === null
    );
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('Skip')).toBe('25');
    expect(req.request.params.get('Length')).toBe('50');
    expect(req.request.params.get('IsPaid')).toBe(null);
    req.flush({ isSuccess: true, result: null });
  });

  it('listPayables sends IsPaid when provided', () => {
    service.listPayables({ Skip: 0, Length: 25, IsPaid: true }).subscribe();

    const req = httpMock.expectOne((r) => r.url === `${baseUrl}payables`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('IsPaid')).toBe('true');
    req.flush({ isSuccess: true, result: null });
  });

  it('listPayables throws on invalid paging', () => {
    let error: unknown;
    service.listPayables({ Skip: -1, Length: 25 }).subscribe({ error: (e) => (error = e) });
    expect(String(error)).toContain('Invalid Skip.');

    let lengthError: unknown;
    service.listPayables({ Skip: 0, Length: 0 }).subscribe({ error: (e) => (lengthError = e) });
    expect(String(lengthError)).toContain('Invalid Length.');
  });

  it('settlePayable posts body to payables/:id/settle', () => {
    service.settlePayable('pay_1', { Amount: 12.5 }).subscribe();
    const req = httpMock.expectOne(`${baseUrl}payables/pay_1/settle`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ Amount: 12.5 });
    req.flush({ isSuccess: true, result: null });
  });

  it('settlePayable throws on invalid id or amount', () => {
    let error: unknown;
    service.settlePayable('   ', { Amount: 1 }).subscribe({ error: (e) => (error = e) });
    expect(String(error)).toContain('Invalid payable id.');

    let amountError: unknown;
    service.settlePayable('pay_1', { Amount: 0 }).subscribe({ error: (e) => (amountError = e) });
    expect(String(amountError)).toContain('Invalid settlement amount.');
  });
});

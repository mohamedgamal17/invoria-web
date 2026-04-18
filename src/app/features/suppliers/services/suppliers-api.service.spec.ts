import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { environment } from '../../../../environments/environment';
import type { Supplier } from '../models/supplier.entity';
import { filterSuppliersByName, SuppliersApiService } from './suppliers-api.service';

describe('filterSuppliersByName', () => {
  const rows: Supplier[] = [
    {
      id: '1',
      name: 'Alpha Supplies',
      supplierCode: 'A1',
      createdAt: '2026-01-01T00:00:00.000Z'
    },
    {
      id: '2',
      name: 'Beta Corp',
      supplierCode: 'B1',
      createdAt: '2026-01-01T00:00:00.000Z'
    },
    {
      id: '3',
      name: 'alpha lowercase',
      supplierCode: 'C1',
      createdAt: '2026-01-01T00:00:00.000Z'
    }
  ];

  it('returns all rows when filter is empty or whitespace', () => {
    expect(filterSuppliersByName(rows, '')).toEqual(rows);
    expect(filterSuppliersByName(rows, '   ')).toEqual(rows);
    expect(filterSuppliersByName(rows, undefined)).toEqual(rows);
  });

  it('filters case-insensitively on name', () => {
    expect(filterSuppliersByName(rows, 'alpha')).toEqual([rows[0], rows[2]]);
    expect(filterSuppliersByName(rows, 'BETA')).toEqual([rows[1]]);
  });
});

describe('SuppliersApiService', () => {
  let service: SuppliersApiService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.apiUrl.replace(/\/?$/, '/')}`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SuppliersApiService, provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(SuppliersApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('getSupplier requests GET suppliers/:id', () => {
    service.getSupplier('sup_1').subscribe();
    const req = httpMock.expectOne(`${baseUrl}suppliers/sup_1`);
    expect(req.request.method).toBe('GET');
    req.flush({ isSuccess: true, result: null });
  });

  it('createSupplier posts body to suppliers', () => {
    const body = { SupplierCode: 'X', Name: 'Y', ContactEmail: null, Phone: null };
    service.createSupplier(body).subscribe();
    const req = httpMock.expectOne(`${baseUrl}suppliers`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush({ isSuccess: true, result: null });
  });

  it('updateSupplier puts body to suppliers/:id', () => {
    const body = { SupplierCode: 'X', Name: 'Y', ContactEmail: null, Phone: null };
    service.updateSupplier('id1', body).subscribe();
    const req = httpMock.expectOne(`${baseUrl}suppliers/id1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(body);
    req.flush({ isSuccess: true, result: null });
  });
});

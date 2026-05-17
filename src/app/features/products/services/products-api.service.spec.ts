import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { environment } from '../../../../environments/environment';
import type { Product } from '../models/product.entity';
import { productSearchListRequest } from '../models/list-product.request';
import { ProductsApiService } from './products-api.service';

describe('ProductsApiService', () => {
  let service: ProductsApiService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.apiUrl.replace(/\/?$/, '/')}`;

  const productRow: Product = {
    id: '1',
    name: 'Alpha Widget',
    price: 10,
    stock: { actualQuantity: 0, reservedQuantity: 0 },
    createdAt: ''
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProductsApiService, provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(ProductsApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('searchProducts omits Name when filter is empty or whitespace', () => {
    let result: Product[] | undefined;
    service.searchProducts(productSearchListRequest, '   ').subscribe((rows) => {
      result = rows;
    });

    const req = httpMock.expectOne(
      (r) => r.url === `${baseUrl}products` && r.params.get('Name') === null
    );
    expect(req.request.params.get('Skip')).toBe('0');
    expect(req.request.params.get('Length')).toBe('20');
    req.flush({
      isSuccess: true,
      result: { data: [productRow], pagingInfo: { totalCount: 1 } }
    });

    expect(result).toEqual([productRow]);
  });

  it('searchProducts sends Name query param when filter is non-empty', () => {
    let result: Product[] | undefined;
    service.searchProducts(productSearchListRequest, '  alpha  ').subscribe((rows) => {
      result = rows;
    });

    const req = httpMock.expectOne(
      (r) => r.url === `${baseUrl}products` && r.params.get('Name') === 'alpha'
    );
    req.flush({
      isSuccess: true,
      result: { data: [productRow], pagingInfo: { totalCount: 1 } }
    });

    expect(result).toEqual([productRow]);
  });

  it('searchProducts returns empty array when response is not successful', () => {
    let result: Product[] | undefined;
    service.searchProducts(productSearchListRequest).subscribe((rows) => {
      result = rows;
    });

    const req = httpMock.expectOne(`${baseUrl}products?Skip=0&Length=20`);
    req.flush({ isSuccess: false, result: null });

    expect(result).toEqual([]);
  });
});

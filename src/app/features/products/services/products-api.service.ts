import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable, throwError } from 'rxjs';

import { ApiResponse } from '../../../core/models/api-response';
import { Paging } from '../../../core/models/paging';
import { environment } from '../../../../environments/environment';
import type { Product } from '../models/product.entity';
import type { CreateProductRequest } from '../models/create-product.request';
import type { ListProductRequest } from '../models/list-product.request';
import type { UpdateProductRequest } from '../models/update-product.request';
import { httpParamsFromRequest } from '../../../shared/requests/http-params-from-request';

@Injectable({
  providedIn: 'root'
})
export class ProductsApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl.replace(/\/?$/, '/')}`;

  listProducts(request: ListProductRequest): Observable<ApiResponse<Paging<Product>>> {
    if (request.Skip < 0) {
      return throwError(() => new Error('Invalid Skip.'));
    }
    if (request.Length <= 0) {
      return throwError(() => new Error('Invalid Length.'));
    }

    return this.http.get<ApiResponse<Paging<Product>>>(`${this.baseUrl}products`, {
      params: httpParamsFromRequest(request)
    });
  }

  getProduct(id: string): Observable<ApiResponse<Product>> {
    return this.http.get<ApiResponse<Product>>(
      `${this.baseUrl}products/${encodeURIComponent(id)}`
    );
  }

  createProduct(request: CreateProductRequest): Observable<ApiResponse<Product>> {
    this.assertCreateOrUpdateBody(request);
    return this.http.post<ApiResponse<Product>>(`${this.baseUrl}products`, request);
  }

  updateProduct(
    id: string,
    request: UpdateProductRequest
  ): Observable<ApiResponse<Product>> {
    this.assertCreateOrUpdateBody(request);
    return this.http.put<ApiResponse<Product>>(
      `${this.baseUrl}products/${encodeURIComponent(id)}`,
      request
    );
  }

  deleteProduct(id: string): Observable<ApiResponse<unknown>> {
    return this.http.delete<ApiResponse<unknown>>(
      `${this.baseUrl}products/${encodeURIComponent(id)}`
    );
  }

  /**
   * Loads products for the given list query and filters by name or code (orders autocomplete).
   */
  searchProducts(
    listRequest: ListProductRequest,
    nameOrCodeFilter: string
  ): Observable<Product[]> {
    return this.http
      .get<ApiResponse<Paging<Product>>>(`${this.baseUrl}products`, {
        params: httpParamsFromRequest(listRequest)
      })
      .pipe(
        map((body) => {
          if (!body.isSuccess || !body.result) {
            return [];
          }
          const normalizedQuery = (nameOrCodeFilter || '').toLowerCase().trim();
          const rows = body.result.data;
          if (!normalizedQuery) {
            return rows.slice(0, 20);
          }
          return rows
            .filter(
              (p) =>
                p.name.toLowerCase().includes(normalizedQuery) ||
                p.code.toLowerCase().includes(normalizedQuery)
            )
            .slice(0, 20);
        })
      );
  }

  private assertCreateOrUpdateBody(request: CreateProductRequest): void {
    const name = (request.Name || '').trim();
    const code = (request.Code || '').trim();
    const price = request.Price;

    if (!name) {
      throw new Error('Name is required.');
    }
    if (!code) {
      throw new Error('Code is required.');
    }
    if (!Number.isFinite(price) || price < 0) {
      throw new Error('Price must be a valid non-negative number.');
    }
  }
}

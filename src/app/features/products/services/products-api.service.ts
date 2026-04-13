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
   * Loads products for orders autocomplete from GET /products using `listRequest` only.
   * Rows are returned as the API sends them (no client-side filtering). When OpenAPI adds
   * search query params, extend {@link ListProductRequest} and pass `nameOrCodeFilter`
   * through here; until then the second argument is ignored for HTTP.
   */
  searchProducts(
    listRequest: ListProductRequest,
    _nameOrCodeFilter?: string
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
          return body.result.data;
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

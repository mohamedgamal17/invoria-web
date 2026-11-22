import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';

import { ApiResponse } from '@invoria/core';
import { Paging } from '@invoria/core';
import { API_BASE_URL, normalizeApiBaseUrl } from '@invoria/core';
import type { Batch } from '../models/batch.entity';
import type { CreateBatchRequest } from '../models/create-batch.request';
import type { ListBatchRequest } from '../models/list-batch.request';
import type { UpdateBatchRequest } from '../models/update-batch.request';
import { httpParamsFromRequest } from '@invoria/utils';

@Injectable({
  providedIn: 'root'
})
export class BatchesApiService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);
  private readonly baseUrl = normalizeApiBaseUrl(this.apiBaseUrl);

  listBatches(request: ListBatchRequest): Observable<ApiResponse<Paging<Batch>>> {
    if (request.skip < 0) {
      return throwError(() => new Error('Invalid Skip.'));
    }
    if (request.length <= 0) {
      return throwError(() => new Error('Invalid Length.'));
    }
    const productId = (request.productId || '').trim();
    if (!productId) {
      return throwError(() => new Error('ProductId is required.'));
    }

    return this.http.get<ApiResponse<Paging<Batch>>>(`${this.baseUrl}batches`, {
      params: httpParamsFromRequest(request)
    });
  }

  getBatch(id: string): Observable<ApiResponse<Batch>> {
    return this.http.get<ApiResponse<Batch>>(
      `${this.baseUrl}batches/${encodeURIComponent(id)}`
    );
  }

  createBatch(request: CreateBatchRequest): Observable<ApiResponse<Batch>> {
    this.assertCreateBody(request);
    return this.http.post<ApiResponse<Batch>>(`${this.baseUrl}batches`, request);
  }

  updateBatch(id: string, request: UpdateBatchRequest): Observable<ApiResponse<Batch>> {
    this.assertUpdateBody(request);
    return this.http.put<ApiResponse<Batch>>(
      `${this.baseUrl}batches/${encodeURIComponent(id)}`,
      request
    );
  }

  private assertCreateBody(request: CreateBatchRequest): void {
    const productId = (request.productId || '').trim();
    if (!productId) {
      throw new Error('ProductId is required.');
    }
    const qty = request.quantity;
    if (!Number.isFinite(qty) || qty < 1) {
      throw new Error('Quantity must be at least 1.');
    }
    const price = request.purchasePrice;
    if (!Number.isFinite(price) || price <= 0) {
      throw new Error('PurchasePrice must be greater than zero.');
    }
  }

  private assertUpdateBody(request: UpdateBatchRequest): void {
    const qty = request.quantity;
    if (!Number.isFinite(qty) || qty < 0) {
      throw new Error('Quantity must be a valid non-negative number.');
    }
    const price = request.purchasePrice;
    if (!Number.isFinite(price) || price <= 0) {
      throw new Error('PurchasePrice must be greater than zero.');
    }
  }
}

import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';

import { ApiResponse } from '../../../core/models/api-response';
import { Paging } from '../../../core/models/paging';
import { environment } from '../../../../environments/environment';
import type { PurchaseOrder } from '../models/purchase-order.entity';
import type { CreatePurchaseOrderRequest } from '../models/create-purchase-order.request';
import type { ListPurchaseOrderRequest } from '../models/list-purchase-order.request';
import { httpParamsFromRequest } from '../../../shared/requests/http-params-from-request';

@Injectable({
  providedIn: 'root'
})
export class PurchaseOrdersApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl.replace(/\/?$/, '/')}`;

  listPurchaseOrders(request: ListPurchaseOrderRequest): Observable<ApiResponse<Paging<PurchaseOrder>>> {
    if (request.Skip < 0) {
      return throwError(() => new Error('Invalid Skip.'));
    }
    if (request.Length <= 0) {
      return throwError(() => new Error('Invalid Length.'));
    }

    return this.http.get<ApiResponse<Paging<PurchaseOrder>>>(`${this.baseUrl}purchase-orders`, {
      params: httpParamsFromRequest(request)
    });
  }

  getPurchaseOrder(id: string): Observable<ApiResponse<PurchaseOrder>> {
    return this.http.get<ApiResponse<PurchaseOrder>>(
      `${this.baseUrl}purchase-orders/${encodeURIComponent(id)}`
    );
  }

  createPurchaseOrder(request: CreatePurchaseOrderRequest): Observable<ApiResponse<PurchaseOrder>> {
    this.assertCreateBody(request);
    return this.http.post<ApiResponse<PurchaseOrder>>(`${this.baseUrl}purchase-orders`, request);
  }

  submitPurchaseOrder(id: string): Observable<ApiResponse<PurchaseOrder>> {
    return this.http.post<ApiResponse<PurchaseOrder>>(
      `${this.baseUrl}purchase-orders/${encodeURIComponent(id)}/submit`,
      {}
    );
  }

  approvePurchaseOrder(id: string): Observable<ApiResponse<PurchaseOrder>> {
    return this.http.post<ApiResponse<PurchaseOrder>>(
      `${this.baseUrl}purchase-orders/${encodeURIComponent(id)}/approve`,
      {}
    );
  }

  rejectPurchaseOrder(id: string): Observable<ApiResponse<PurchaseOrder>> {
    return this.http.post<ApiResponse<PurchaseOrder>>(
      `${this.baseUrl}purchase-orders/${encodeURIComponent(id)}/reject`,
      {}
    );
  }

  cancelPurchaseOrder(id: string): Observable<ApiResponse<PurchaseOrder>> {
    return this.http.post<ApiResponse<PurchaseOrder>>(
      `${this.baseUrl}purchase-orders/${encodeURIComponent(id)}/cancel`,
      {}
    );
  }

  completePurchaseOrder(id: string): Observable<ApiResponse<PurchaseOrder>> {
    return this.http.post<ApiResponse<PurchaseOrder>>(
      `${this.baseUrl}purchase-orders/${encodeURIComponent(id)}/complete`,
      {}
    );
  }

  reopenPurchaseOrder(id: string): Observable<ApiResponse<PurchaseOrder>> {
    return this.http.post<ApiResponse<PurchaseOrder>>(
      `${this.baseUrl}purchase-orders/${encodeURIComponent(id)}/reopen`,
      {}
    );
  }

  private assertCreateBody(request: CreatePurchaseOrderRequest): void {
    const supplierId = (request.SupplierId || '').trim();
    if (!supplierId) {
      throw new Error('SupplierId is required.');
    }
    if (!request.PurchaseOrderItems?.length) {
      throw new Error('At least one purchase order line item is required.');
    }
    for (const line of request.PurchaseOrderItems) {
      this.assertLineItem(line);
    }
    if (!Number.isFinite(request.TaxAmount) || request.TaxAmount < 0) {
      throw new Error('TaxAmount must be a valid non-negative number.');
    }
    if (!Number.isFinite(request.DiscountAmount) || request.DiscountAmount < 0) {
      throw new Error('DiscountAmount must be a valid non-negative number.');
    }
  }

  private assertLineItem(line: {
    ProductId: string;
    Quantity: number;
    UnitPrice: number;
    SupplierProductCode?: string | null;
  }): void {
    const productId = (line.ProductId || '').trim();
    if (!productId) {
      throw new Error('ProductId is required for each line item.');
    }
    if (!Number.isInteger(line.Quantity) || line.Quantity <= 0) {
      throw new Error('Quantity must be a positive integer.');
    }
    if (!Number.isFinite(line.UnitPrice) || line.UnitPrice < 0) {
      throw new Error('UnitPrice must be a valid non-negative number.');
    }
  }
}

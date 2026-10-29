import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';

import { ApiResponse } from '../../../core/models/api-response';
import { Paging } from '../../../core/models/paging';
import { environment } from '../../../../environments/environment';
import type { Payable } from '../models/payable.entity';
import type { ListPayableRequest } from '../models/list-payable.request';
import type { SettlePayableRequest } from '../models/settle-payable.request';
import { httpParamsFromRequest } from '../../../shared/requests/http-params-from-request';

@Injectable({
  providedIn: 'root'
})
export class PayablesApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl.replace(/\/?$/, '/')}`;

  listPayables(request: ListPayableRequest): Observable<ApiResponse<Paging<Payable>>> {
    if (request.Skip < 0) {
      return throwError(() => new Error('Invalid Skip.'));
    }
    if (request.Length <= 0) {
      return throwError(() => new Error('Invalid Length.'));
    }

    return this.http.get<ApiResponse<Paging<Payable>>>(`${this.baseUrl}payables`, {
      params: httpParamsFromRequest(request)
    });
  }

  getPayable(id: string): Observable<ApiResponse<Payable>> {
    return this.http.get<ApiResponse<Payable>>(
      `${this.baseUrl}payables/${encodeURIComponent(id)}`
    );
  }

  /** GET /payables/by-purchase-order/{purchaseOrderId} — returns the payable for a purchase order. */
  getPayableByPurchaseOrderId(purchaseOrderId: string): Observable<ApiResponse<Payable>> {
    return this.http.get<ApiResponse<Payable>>(
      `${this.baseUrl}payables/by-purchase-order/${encodeURIComponent(purchaseOrderId)}`
    );
  }

  /** POST /payables/{id}/settle — returns the updated payable with the new settlement. */
  settlePayable(id: string, request: SettlePayableRequest): Observable<ApiResponse<Payable>> {
    if (!id.trim()) {
      return throwError(() => new Error('Invalid payable id.'));
    }
    if (!Number.isFinite(request.Amount) || request.Amount <= 0) {
      return throwError(() => new Error('Invalid settlement amount.'));
    }

    return this.http.post<ApiResponse<Payable>>(
      `${this.baseUrl}payables/${encodeURIComponent(id)}/settle`,
      request
    );
  }
}

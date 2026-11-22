import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';

import { ApiResponse , API_BASE_URL, normalizeApiBaseUrl } from '@invoria/core';
import { Paging } from '@invoria/core';
import type { Receivable } from '../models/receivable.entity';
import type { ListReceivableRequest } from '../models/list-receivable.request';
import type { SettleReceivableRequest } from '../models/settle-receivable.request';
import { httpParamsFromRequest } from '@invoria/utils';

@Injectable({
  providedIn: 'root'
})
export class ReceivablesApiService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);
  private readonly baseUrl = normalizeApiBaseUrl(this.apiBaseUrl);

  listReceivables(request: ListReceivableRequest): Observable<ApiResponse<Paging<Receivable>>> {
    if (request.skip < 0) {
      return throwError(() => new Error('Invalid Skip.'));
    }
    if (request.length <= 0) {
      return throwError(() => new Error('Invalid Length.'));
    }

    return this.http.get<ApiResponse<Paging<Receivable>>>(`${this.baseUrl}receivables`, {
      params: httpParamsFromRequest(request)
    });
  }

  getReceivable(id: string): Observable<ApiResponse<Receivable>> {
    return this.http.get<ApiResponse<Receivable>>(
      `${this.baseUrl}receivables/${encodeURIComponent(id)}`
    );
  }

  /** POST /receivables/{id}/settle — returns the updated receivable with the new settlement. */
  settleReceivable(id: string, request: SettleReceivableRequest): Observable<ApiResponse<Receivable>> {
    if (!id.trim()) {
      return throwError(() => new Error('Invalid receivable id.'));
    }
    if (!Number.isFinite(request.amount) || request.amount <= 0) {
      return throwError(() => new Error('Invalid settlement amount.'));
    }

    return this.http.post<ApiResponse<Receivable>>(
      `${this.baseUrl}receivables/${encodeURIComponent(id)}/settle`,
      request
    );
  }
}

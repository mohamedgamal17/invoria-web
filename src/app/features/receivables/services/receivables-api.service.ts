import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';

import { ApiResponse } from '../../../core/models/api-response';
import { Paging } from '../../../core/models/paging';
import { environment } from '../../../../environments/environment';
import type { Receivable } from '../models/receivable.entity';
import type { ListReceivableRequest } from '../models/list-receivable.request';
import type { SettleReceivableRequest } from '../models/settle-receivable.request';
import { httpParamsFromRequest } from '../../../shared/requests/http-params-from-request';

@Injectable({
  providedIn: 'root'
})
export class ReceivablesApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl.replace(/\/?$/, '/')}`;

  listReceivables(request: ListReceivableRequest): Observable<ApiResponse<Paging<Receivable>>> {
    if (request.Skip < 0) {
      return throwError(() => new Error('Invalid Skip.'));
    }
    if (request.Length <= 0) {
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
    if (!Number.isFinite(request.Amount) || request.Amount <= 0) {
      return throwError(() => new Error('Invalid settlement amount.'));
    }

    return this.http.post<ApiResponse<Receivable>>(
      `${this.baseUrl}receivables/${encodeURIComponent(id)}/settle`,
      request
    );
  }
}

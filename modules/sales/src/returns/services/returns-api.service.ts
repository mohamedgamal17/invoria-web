import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';

import { ApiResponse , API_BASE_URL, normalizeApiBaseUrl } from '@invoria/core';
import { Paging } from '@invoria/core';
import type { Return } from '../models/return.entity';
import type { ListReturnRequest } from '../models/list-return.request';
import { httpParamsFromRequest } from '@invoria/utils';

@Injectable({
  providedIn: 'root'
})
export class ReturnsApiService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);
  private readonly baseUrl = normalizeApiBaseUrl(this.apiBaseUrl);

  listReturns(request: ListReturnRequest): Observable<ApiResponse<Paging<Return>>> {
    if (request.skip < 0) {
      return throwError(() => new Error('Invalid Skip.'));
    }
    if (request.length <= 0) {
      return throwError(() => new Error('Invalid Length.'));
    }

    return this.http.get<ApiResponse<Paging<Return>>>(`${this.baseUrl}returns`, {
      params: httpParamsFromRequest(request)
    });
  }

  getReturn(id: string): Observable<ApiResponse<Return>> {
    return this.http.get<ApiResponse<Return>>(
      `${this.baseUrl}returns/${encodeURIComponent(id)}`
    );
  }

  approveReturn(id: string): Observable<ApiResponse<Return>> {
    return this.http.post<ApiResponse<Return>>(
      `${this.baseUrl}returns/${encodeURIComponent(id)}/approve`,
      {}
    );
  }

  rejectReturn(id: string): Observable<ApiResponse<Return>> {
    return this.http.post<ApiResponse<Return>>(
      `${this.baseUrl}returns/${encodeURIComponent(id)}/reject`,
      {}
    );
  }
}

import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';

import { ApiResponse } from '../../../core/models/api-response';
import { Paging } from '../../../core/models/paging';
import { environment } from '../../../../environments/environment';
import type { Return } from '../models/return.entity';
import type { ListReturnRequest } from '../models/list-return.request';
import { httpParamsFromRequest } from '../../../shared/requests/http-params-from-request';

@Injectable({
  providedIn: 'root'
})
export class ReturnsApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl.replace(/\/?$/, '/')}`;

  listReturns(request: ListReturnRequest): Observable<ApiResponse<Paging<Return>>> {
    if (request.Skip < 0) {
      return throwError(() => new Error('Invalid Skip.'));
    }
    if (request.Length <= 0) {
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
}

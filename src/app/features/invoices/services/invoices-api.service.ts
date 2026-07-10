import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';

import { ApiResponse } from '../../../core/models/api-response';
import { Paging } from '../../../core/models/paging';
import { environment } from '../../../../environments/environment';
import type { Invoice } from '../models/invoice.entity';
import type { ListInvoiceRequest } from '../models/list-invoice.request';
import { httpParamsFromRequest } from '../../../shared/requests/http-params-from-request';

@Injectable({
  providedIn: 'root'
})
export class InvoicesApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl.replace(/\/?$/, '/')}`;

  listInvoices(request: ListInvoiceRequest): Observable<ApiResponse<Paging<Invoice>>> {
    if (request.Skip < 0) {
      return throwError(() => new Error('Invalid Skip.'));
    }
    if (request.Length <= 0) {
      return throwError(() => new Error('Invalid Length.'));
    }

    return this.http.get<ApiResponse<Paging<Invoice>>>(`${this.baseUrl}invoices`, {
      params: httpParamsFromRequest(request)
    });
  }

  getInvoice(id: string): Observable<ApiResponse<Invoice>> {
    return this.http.get<ApiResponse<Invoice>>(
      `${this.baseUrl}invoices/${encodeURIComponent(id)}`
    );
  }
}

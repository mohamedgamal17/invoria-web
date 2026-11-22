import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';

import { ApiResponse , API_BASE_URL, normalizeApiBaseUrl } from '@invoria/core';
import { Paging } from '@invoria/core';
import type { Invoice } from '../models/invoice.entity';
import type { ListInvoiceRequest } from '../models/list-invoice.request';
import { httpParamsFromRequest } from '@invoria/utils';

@Injectable({
  providedIn: 'root'
})
export class InvoicesApiService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);
  private readonly baseUrl = normalizeApiBaseUrl(this.apiBaseUrl);

  listInvoices(request: ListInvoiceRequest): Observable<ApiResponse<Paging<Invoice>>> {
    if (request.skip < 0) {
      return throwError(() => new Error('Invalid Skip.'));
    }
    if (request.length <= 0) {
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

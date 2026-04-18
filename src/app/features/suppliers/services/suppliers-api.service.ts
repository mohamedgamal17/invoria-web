import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable, throwError } from 'rxjs';

import { ApiResponse } from '../../../core/models/api-response';
import { Paging } from '../../../core/models/paging';
import { environment } from '../../../../environments/environment';
import { httpParamsFromRequest } from '../../../shared/requests/http-params-from-request';
import type { Supplier } from '../models/supplier.entity';
import type { ListSupplierRequest } from '../models/list-supplier.request';

/** Client-side name filter for autocomplete until API exposes search query params. */
export function filterSuppliersByName(suppliers: Supplier[], nameFilter: string | undefined): Supplier[] {
  const q = (nameFilter ?? '').trim().toLowerCase();
  if (!q) {
    return suppliers;
  }
  return suppliers.filter((s) => (s.name || '').toLowerCase().includes(q));
}

@Injectable({
  providedIn: 'root'
})
export class SuppliersApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl.replace(/\/?$/, '/')}`;

  listSuppliers(request: ListSupplierRequest): Observable<ApiResponse<Paging<Supplier>>> {
    if (request.Skip < 0) {
      return throwError(() => new Error('Invalid Skip.'));
    }
    if (request.Length <= 0) {
      return throwError(() => new Error('Invalid Length.'));
    }

    return this.http.get<ApiResponse<Paging<Supplier>>>(`${this.baseUrl}suppliers`, {
      params: httpParamsFromRequest(request)
    });
  }

  /**
   * Loads suppliers for autocomplete from GET /suppliers; optional `nameFilter` filters client-side on `name`.
   * When OpenAPI adds search query params, extend {@link ListSupplierRequest} and pass the filter through HTTP.
   */
  searchSuppliers(listRequest: ListSupplierRequest, nameFilter?: string): Observable<Supplier[]> {
    return this.http
      .get<ApiResponse<Paging<Supplier>>>(`${this.baseUrl}suppliers`, {
        params: httpParamsFromRequest(listRequest)
      })
      .pipe(
        map((body) => {
          if (!body.isSuccess || !body.result) {
            return [];
          }
          return filterSuppliersByName(body.result.data, nameFilter);
        })
      );
  }
}

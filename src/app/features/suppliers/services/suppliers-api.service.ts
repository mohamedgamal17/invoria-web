import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable, throwError } from 'rxjs';

import { ApiResponse } from '../../../core/models/api-response';
import { Paging } from '../../../core/models/paging';
import { environment } from '../../../../environments/environment';
import { httpParamsFromRequest } from '../../../shared/requests/http-params-from-request';
import type { Supplier } from '../models/supplier.entity';
import type { ListSupplierRequest } from '../models/list-supplier.request';
import type { CreateSupplierRequest } from '../models/create-supplier.request';
import type { UpdateSupplierRequest } from '../models/update-supplier.request';

/** Client-side name filter helper (retained for unit tests). */
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

  getSupplier(id: string): Observable<ApiResponse<Supplier>> {
    return this.http.get<ApiResponse<Supplier>>(
      `${this.baseUrl}suppliers/${encodeURIComponent(id)}`
    );
  }

  createSupplier(request: CreateSupplierRequest): Observable<ApiResponse<Supplier>> {
    this.assertSupplierBody(request.SupplierCode, request.Name);
    return this.http.post<ApiResponse<Supplier>>(`${this.baseUrl}suppliers`, request);
  }

  updateSupplier(id: string, request: UpdateSupplierRequest): Observable<ApiResponse<Supplier>> {
    this.assertSupplierBody(request.SupplierCode, request.Name);
    return this.http.put<ApiResponse<Supplier>>(
      `${this.baseUrl}suppliers/${encodeURIComponent(id)}`,
      request
    );
  }

  /**
   * Loads suppliers for autocomplete from GET /suppliers.
   * Optional `nameFilter` is sent as the `Name` query param when non-empty.
   */
  searchSuppliers(listRequest: ListSupplierRequest, nameFilter?: string): Observable<Supplier[]> {
    const trimmed = (nameFilter ?? '').trim();
    const request: ListSupplierRequest = {
      ...listRequest,
      Name: trimmed ? trimmed : undefined
    };
    return this.http
      .get<ApiResponse<Paging<Supplier>>>(`${this.baseUrl}suppliers`, {
        params: httpParamsFromRequest(request)
      })
      .pipe(
        map((body) => {
          if (!body.isSuccess || !body.result) {
            return [];
          }
          return body.result.data;
        })
      );
  }

  private assertSupplierBody(supplierCode: string | undefined, name: string | undefined): void {
    if (!(supplierCode ?? '').trim()) {
      throw new Error('SupplierCode is required.');
    }
    if (!(name ?? '').trim()) {
      throw new Error('Name is required.');
    }
  }
}

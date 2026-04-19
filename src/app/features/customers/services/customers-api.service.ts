import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable, throwError } from 'rxjs';

import { ApiResponse } from '../../../core/models/api-response';
import { Paging } from '../../../core/models/paging';
import { environment } from '../../../../environments/environment';
import type { Customer } from '../models/customer.entity';
import type { CreateCustomerRequest } from '../models/create-customer.request';
import type { ListCustomerRequest } from '../models/list-customer.request';
import type { UpdateCustomerRequest } from '../models/update-customer.request';
import { httpParamsFromRequest } from '../../../shared/requests/http-params-from-request';

@Injectable({
  providedIn: 'root'
})
export class CustomersApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl.replace(/\/?$/, '/')}`;

  listCustomers(request: ListCustomerRequest): Observable<ApiResponse<Paging<Customer>>> {
    if (request.Skip < 0) {
      return throwError(() => new Error('Invalid Skip.'));
    }
    if (request.Length <= 0) {
      return throwError(() => new Error('Invalid Length.'));
    }

    return this.http.get<ApiResponse<Paging<Customer>>>(`${this.baseUrl}customers`, {
      params: httpParamsFromRequest(request)
    });
  }

  getCustomer(id: string): Observable<ApiResponse<Customer>> {
    return this.http.get<ApiResponse<Customer>>(
      `${this.baseUrl}customers/${encodeURIComponent(id)}`
    );
  }

  createCustomer(request: CreateCustomerRequest): Observable<ApiResponse<Customer>> {
    this.assertName(request.Name);
    return this.http.post<ApiResponse<Customer>>(`${this.baseUrl}customers`, request);
  }

  updateCustomer(
    id: string,
    request: UpdateCustomerRequest
  ): Observable<ApiResponse<Customer>> {
    this.assertName(request.Name);
    return this.http.put<ApiResponse<Customer>>(
      `${this.baseUrl}customers/${encodeURIComponent(id)}`,
      request
    );
  }

  /**
   * Loads customers for orders autocomplete from GET /customers.
   * Optional `nameFilter` is sent as the `Name` query param when non-empty.
   */
  searchCustomers(
    listRequest: ListCustomerRequest,
    nameFilter?: string
  ): Observable<Customer[]> {
    const trimmed = (nameFilter ?? '').trim();
    const request: ListCustomerRequest = {
      ...listRequest,
      Name: trimmed ? trimmed : null
    };
    return this.http
      .get<ApiResponse<Paging<Customer>>>(`${this.baseUrl}customers`, {
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

  private assertName(name: string | undefined): void {
    const trimmed = (name || '').trim();
    if (!trimmed) {
      throw new Error('Name is required.');
    }
  }
}

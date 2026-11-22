import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable, throwError } from 'rxjs';

import { ApiResponse , API_BASE_URL, normalizeApiBaseUrl } from '@invoria/core';
import { Paging } from '@invoria/core';
import type { Customer } from '../models/customer.entity';
import type { CustomerRequest } from '../models/customer-request';
import type { ListCustomerRequest } from '../models/list-customer.request';
import type { CustomerCreationReportPeriod } from '../models/customer-report.entity';
import type { ListCustomerCreationReportRequest } from '../models/list-customer-report.request';
import type { ReportOverview } from '@invoria/utils';
import { httpParamsFromRequest } from '@invoria/utils';

@Injectable({
  providedIn: 'root'
})
export class CustomersApiService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);
  private readonly baseUrl = normalizeApiBaseUrl(this.apiBaseUrl);

  listCustomers(request: ListCustomerRequest): Observable<ApiResponse<Paging<Customer>>> {
    if (request.skip < 0) {
      return throwError(() => new Error('Invalid Skip.'));
    }
    if (request.length <= 0) {
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

  createCustomer(request: CustomerRequest): Observable<ApiResponse<Customer>> {
    this.assertName(request.name);
    return this.http.post<ApiResponse<Customer>>(`${this.baseUrl}customers`, request);
  }

  updateCustomer(
    id: string,
    request: CustomerRequest
  ): Observable<ApiResponse<Customer>> {
    this.assertName(request.name);
    return this.http.put<ApiResponse<Customer>>(
      `${this.baseUrl}customers/${encodeURIComponent(id)}`,
      request
    );
  }

  /**
   * Loads customers for orders autocomplete from GET /customers.
   * Optional `nameFilter` is sent as the `name` query param when non-empty.
   */
  searchCustomers(
    listRequest: ListCustomerRequest,
    nameFilter?: string
  ): Observable<Customer[]> {
    const trimmed = (nameFilter ?? '').trim();
    const request: ListCustomerRequest = {
      ...listRequest,
      name: trimmed ? trimmed : null
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

  getCustomerCreationReportOverview(): Observable<
    ApiResponse<ReportOverview<CustomerCreationReportPeriod>>
  > {
    return this.http.get<ApiResponse<ReportOverview<CustomerCreationReportPeriod>>>(
      `${this.baseUrl}report/customers/creation/overview`
    );
  }

  listCustomerCreationReportMetrics(
    request: ListCustomerCreationReportRequest
  ): Observable<ApiResponse<Paging<CustomerCreationReportPeriod>>> {
    if (request.skip < 0) {
      return throwError(() => new Error('Invalid Skip.'));
    }
    if (request.length <= 0) {
      return throwError(() => new Error('Invalid Length.'));
    }
    return this.http.get<ApiResponse<Paging<CustomerCreationReportPeriod>>>(
      `${this.baseUrl}report/customers/creation/metrics`,
      { params: httpParamsFromRequest(request) }
    );
  }

  private assertName(name: string | undefined): void {
    const trimmed = (name || '').trim();
    if (!trimmed) {
      throw new Error('Name is required.');
    }
  }
}

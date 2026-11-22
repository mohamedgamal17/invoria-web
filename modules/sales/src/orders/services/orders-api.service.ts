import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';

import { ApiResponse , API_BASE_URL, normalizeApiBaseUrl } from '@invoria/core';
import { Paging } from '@invoria/core';
import type { Order } from '../models/order.entity';
import type { CreateOrderRequest } from '../models/create-order.request';
import type { ListOrderRequest } from '../models/list-order.request';
import type { UpdateOrderItemsRequest } from '../models/update-order-items.request';
import type { AddReturnItemsRequest } from '../models/add-return-items.request';
import type { CompleteOrderRequest } from '../models/complete-order.request';
import type { RecordOrderPaymentRequest } from '../models/record-order-payment.request';
import { OrderPaymentMethod } from '../models/order-payment.enums';
import type {
  OrderCompletionReportPeriod,
  OrderSalesProfitReportPeriod,
  OrderSalesReportPeriod
} from '../models/order-report.entity';
import type {
  ListOrderCompletionReportRequest,
  ListOrderSalesProfitReportRequest,
  ListOrderSalesReportRequest
} from '../models/list-order-report.request';
import type { ReportOverview } from '@invoria/utils';
import { httpParamsFromRequest } from '@invoria/utils';

@Injectable({
  providedIn: 'root'
})
export class OrdersApiService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);
  private readonly baseUrl = normalizeApiBaseUrl(this.apiBaseUrl);

  listOrders(request: ListOrderRequest): Observable<ApiResponse<Paging<Order>>> {
    if (request.skip < 0) {
      return throwError(() => new Error('Invalid Skip.'));
    }
    if (request.length <= 0) {
      return throwError(() => new Error('Invalid Length.'));
    }

    return this.http.get<ApiResponse<Paging<Order>>>(`${this.baseUrl}orders`, {
      params: httpParamsFromRequest(request)
    });
  }

  getOrder(id: string): Observable<ApiResponse<Order>> {
    return this.http.get<ApiResponse<Order>>(
      `${this.baseUrl}orders/${encodeURIComponent(id)}`
    );
  }

  createOrder(request: CreateOrderRequest): Observable<ApiResponse<Order>> {
    this.assertCreateBody(request);
    return this.http.post<ApiResponse<Order>>(`${this.baseUrl}orders`, request);
  }

  recordOrderPayment(
    id: string,
    request: RecordOrderPaymentRequest
  ): Observable<ApiResponse<Order>> {
    this.assertRecordPaymentBody(request);
    return this.http.post<ApiResponse<Order>>(
      `${this.baseUrl}orders/${encodeURIComponent(id)}/payments`,
      request
    );
  }

  updateOrderItems(id: string, request: UpdateOrderItemsRequest): Observable<ApiResponse<Order>> {
    if (!request.items?.length) {
      return throwError(() => new Error('Items is required.'));
    }
    for (const line of request.items) {
      this.assertLineItem(line);
    }
    return this.http.put<ApiResponse<Order>>(
      `${this.baseUrl}orders/${encodeURIComponent(id)}`,
      request
    );
  }

  acceptOrder(id: string): Observable<ApiResponse<Order>> {
    return this.http.post<ApiResponse<Order>>(
      `${this.baseUrl}orders/${encodeURIComponent(id)}/accept`,
      {}
    );
  }

  requestRevisionOrder(id: string): Observable<ApiResponse<Order>> {
    return this.http.post<ApiResponse<Order>>(
      `${this.baseUrl}orders/${encodeURIComponent(id)}/request-revision`,
      {}
    );
  }

  completeOrder(id: string, request?: CompleteOrderRequest): Observable<ApiResponse<Order>> {
    return this.http.post<ApiResponse<Order>>(
      `${this.baseUrl}orders/${encodeURIComponent(id)}/complete`,
      request ?? {}
    );
  }

  cancelOrder(id: string): Observable<ApiResponse<Order>> {
    return this.http.post<ApiResponse<Order>>(
      `${this.baseUrl}orders/${encodeURIComponent(id)}/cancel`,
      null
    );
  }

  addReturnItems(id: string, request: AddReturnItemsRequest): Observable<ApiResponse<Order>> {
    this.assertAddReturnItemsBody(request);
    return this.http.put<ApiResponse<Order>>(
      `${this.baseUrl}orders/${encodeURIComponent(id)}/return-items`,
      request
    );
  }

  getOrderSalesReportOverview(): Observable<ApiResponse<ReportOverview<OrderSalesReportPeriod>>> {
    return this.http.get<ApiResponse<ReportOverview<OrderSalesReportPeriod>>>(
      `${this.baseUrl}report/orders/sales/overview`
    );
  }

  listOrderSalesReportMetrics(
    request: ListOrderSalesReportRequest
  ): Observable<ApiResponse<Paging<OrderSalesReportPeriod>>> {
    if (request.skip < 0) {
      return throwError(() => new Error('Invalid Skip.'));
    }
    if (request.length <= 0) {
      return throwError(() => new Error('Invalid Length.'));
    }
    return this.http.get<ApiResponse<Paging<OrderSalesReportPeriod>>>(
      `${this.baseUrl}report/orders/sales/metrics`,
      { params: httpParamsFromRequest(request) }
    );
  }

  getOrderSalesProfitReportOverview(): Observable<
    ApiResponse<ReportOverview<OrderSalesProfitReportPeriod>>
  > {
    return this.http.get<ApiResponse<ReportOverview<OrderSalesProfitReportPeriod>>>(
      `${this.baseUrl}report/orders/sales-profit/overview`
    );
  }

  listOrderSalesProfitReportMetrics(
    request: ListOrderSalesProfitReportRequest
  ): Observable<ApiResponse<Paging<OrderSalesProfitReportPeriod>>> {
    if (request.skip < 0) {
      return throwError(() => new Error('Invalid Skip.'));
    }
    if (request.length <= 0) {
      return throwError(() => new Error('Invalid Length.'));
    }
    return this.http.get<ApiResponse<Paging<OrderSalesProfitReportPeriod>>>(
      `${this.baseUrl}report/orders/sales-profit/metrics`,
      { params: httpParamsFromRequest(request) }
    );
  }

  getOrderCompletionReportOverview(): Observable<
    ApiResponse<ReportOverview<OrderCompletionReportPeriod>>
  > {
    return this.http.get<ApiResponse<ReportOverview<OrderCompletionReportPeriod>>>(
      `${this.baseUrl}report/orders/completion/overview`
    );
  }

  listOrderCompletionReportMetrics(
    request: ListOrderCompletionReportRequest
  ): Observable<ApiResponse<Paging<OrderCompletionReportPeriod>>> {
    if (request.skip < 0) {
      return throwError(() => new Error('Invalid Skip.'));
    }
    if (request.length <= 0) {
      return throwError(() => new Error('Invalid Length.'));
    }
    return this.http.get<ApiResponse<Paging<OrderCompletionReportPeriod>>>(
      `${this.baseUrl}report/orders/completion/metrics`,
      { params: httpParamsFromRequest(request) }
    );
  }

  private assertCreateBody(request: CreateOrderRequest): void {
    const customerId = (request.customerId || '').trim();
    if (!customerId) {
      throw new Error('CustomerId is required.');
    }
    if (!request.items?.length) {
      throw new Error('At least one line item is required.');
    }
    for (const line of request.items) {
      this.assertLineItem(line);
    }
  }

  private assertRecordPaymentBody(request: RecordOrderPaymentRequest): void {
    if (!Number.isFinite(request.paidAmount) || request.paidAmount <= 0) {
      throw new Error('PaidAmount must be a positive number.');
    }
    const methods = new Set(
      Object.values(OrderPaymentMethod).filter((value): value is OrderPaymentMethod => typeof value === 'number')
    );
    if (!methods.has(request.paymentMethod)) {
      throw new Error('PaymentMethod is invalid.');
    }
  }

  private assertAddReturnItemsBody(request: AddReturnItemsRequest): void {
    if (!request.items?.length) {
      throw new Error('At least one return line is required.');
    }
    for (const line of request.items) {
      const orderItemId = (line.orderItemId || '').trim();
      if (!orderItemId) {
        throw new Error('OrderItemId is required for each return line.');
      }
      if (!Number.isInteger(line.quantity) || line.quantity < 1) {
        throw new Error('Return quantity must be a positive integer.');
      }
    }
  }

  private assertLineItem(line: { productId: string; quantity: number; price: number }): void {
    const productId = (line.productId || '').trim();
    if (!productId) {
      throw new Error('ProductId is required for each line item.');
    }
    if (!Number.isInteger(line.quantity) || line.quantity <= 0) {
      throw new Error('Quantity must be a positive integer.');
    }
    if (!Number.isFinite(line.price) || line.price < 0) {
      throw new Error('Price must be a valid non-negative number.');
    }
  }
}

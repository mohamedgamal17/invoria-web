// Orders contracts & components shared with customer/product detail tabs
export { OrderListComponent } from './orders/components/order-list/order-list.component';
export { OrdersFilterPanelComponent } from './orders/components/orders-filter-panel/orders-filter-panel.component';
export { OrdersApiService } from './orders/services/orders-api.service';
export { orderToUiOrder } from './orders/models/order-ui.mapper';
export type { UiOrder } from './orders/models/order-ui.model';
export type { OrdersListFilters } from './orders/models/orders-list.filters';
export type { ListOrderRequest } from './orders/models/list-order.request';
export { OrderStatus, type Order } from './orders/models/order.entity';
export {
  PaymentStatus,
  PaymentType,
  OrderPaymentMethod,
} from './orders/models/order-payment.enums';
export type {
  OrderCompletionReportPeriod,
  OrderSalesProfitReportPeriod,
  OrderSalesReportPeriod,
} from './orders/models/order-report.entity';
export {
  getOrderStatusLabel,
  getOrderStatusSeverity,
  getOrderStatusUserLabel,
} from './orders/models/order-actions';

// Invoices
export { InvoicesApiService } from './invoices/services/invoices-api.service';
export type { Invoice } from './invoices/models/invoice.entity';

// Returns
export { ReturnsApiService } from './returns/services/returns-api.service';
export type { Return } from './returns/models/return.entity';

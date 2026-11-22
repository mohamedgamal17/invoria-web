/** Query-string filters of the orders list (shared by the orders and customer details lists). */
export interface OrdersListFilters {
  orderNumber: string;
  status: number | null;
  paymentStatus: number | null;
  paymentType: number | null;
}

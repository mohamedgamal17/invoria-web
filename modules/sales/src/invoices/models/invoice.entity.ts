import type { Entity } from '@invoria/core';

export interface InvoiceItem {
  orderItemId: string;
  productId: string;
  quantity: number;
  price: number;
  lineTotal: number;
}

export interface Invoice extends Entity {
  invoiceNumber: string | null;
  customerId: string;
  orderId: string;
  subtotal: number;
  totalPrice: number;
  items: InvoiceItem[];
}

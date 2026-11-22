import type { CustomerRef, ProductRef, PurchaseOrderRef, SupplierRef } from './refs';

export const CUSTOMERS_QUERIES = {
  search: 'customers.search',
  getRefs: 'customers.get-refs',
} as const;

export interface SearchCustomersQuery {
  name: string;
  skip?: number;
  length?: number;
}

export interface GetCustomerRefsQuery {
  ids: string[];
}

export const CATALOG_QUERIES = {
  searchProducts: 'catalog.search-products',
  getProducts: 'catalog.get-products',
} as const;

export interface SearchProductsQuery {
  name: string;
  skip?: number;
  length?: number;
}

export interface GetProductsQuery {
  ids: string[];
}

export const PROCUREMENT_QUERIES = {
  searchSuppliers: 'procurement.search-suppliers',
  getSuppliers: 'procurement.get-suppliers',
  getPurchaseOrders: 'procurement.get-purchase-orders',
} as const;

export interface SearchSuppliersQuery {
  name: string;
  skip?: number;
  length?: number;
}

export interface GetSuppliersQuery {
  ids: string[];
}

export interface GetPurchaseOrdersQuery {
  ids: string[];
}

export type CustomerSearchResult = CustomerRef;
export type ProductSearchResult = ProductRef;
export type SupplierSearchResult = SupplierRef;
export type PurchaseOrderLookupResult = PurchaseOrderRef;

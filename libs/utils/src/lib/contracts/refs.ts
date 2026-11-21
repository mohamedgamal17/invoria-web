export interface CustomerRef {
  id: string;
  name: string;
}

export interface ProductRef {
  id: string;
  name: string;
  price: number;
}

export interface SupplierRef {
  id: string;
  name: string;
  contactEmail?: string | null;
  phone?: string | null;
}

export interface PurchaseOrderRef {
  id: string;
  purchaseNumber: string;
  supplierId: string;
}

export interface OrderRef {
  id: string;
  orderNumber: string;
  customerId: string;
}

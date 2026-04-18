/**
 * Body for POST /suppliers.
 */
export interface CreateSupplierRequest {
  SupplierCode: string;
  Name: string;
  ContactEmail?: string | null;
  Phone?: string | null;
}

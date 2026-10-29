/**
 * Body for POST /suppliers.
 */
export interface CreateSupplierRequest {
  Name: string;
  ContactEmail?: string | null;
  Phone?: string | null;
}

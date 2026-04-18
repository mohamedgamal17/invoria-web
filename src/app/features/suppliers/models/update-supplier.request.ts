/**
 * Body for PUT /suppliers/{id}.
 */
export interface UpdateSupplierRequest {
  SupplierCode: string;
  Name: string;
  ContactEmail?: string | null;
  Phone?: string | null;
}

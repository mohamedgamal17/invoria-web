/**
 * Body for PUT /suppliers/{id}.
 */
export interface UpdateSupplierRequest {
  Name: string;
  ContactEmail?: string | null;
  Phone?: string | null;
}

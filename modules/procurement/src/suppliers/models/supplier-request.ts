/**
 * Body for POST /suppliers and PUT /suppliers/{id}.
 */
export interface SupplierRequest {
  name: string;
  contactEmail?: string | null;
  phone?: string | null;
}

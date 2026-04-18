import { Entity } from '../../../core/models/entity';

/** Supplier from GET/POST/PUT (matches procurement SupplierDto / list rows). */
export interface Supplier extends Entity {
  supplierCode: string;
  name: string;
  contactEmail?: string | null;
  phone?: string | null;
}

/**
 * Picker / PO embed when a full {@link Supplier} row is unavailable.
 * Full list/detail rows satisfy this type.
 */
export type SupplierChoice = Pick<Supplier, 'id' | 'name'> & Partial<Omit<Supplier, 'id' | 'name'>>;

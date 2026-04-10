export interface Entity {
  id: string;
  createdAt: string;
  createdby?: string;
  lastModifiedAt?: string;
  lastModifiedBy?: string;
}

/**
 * Generic helper for entities that share base fields.
 */
export type TypedEntity<T extends object = Record<string, never>> = Entity & T;

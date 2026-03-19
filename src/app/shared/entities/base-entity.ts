export type EntityId = string;

export type AuditFields = {
  createdAt: string;
  createdBy: string;
  lastModifiedAt: string;
  lastModifiedBy: string;
};

export type BaseEntity = {
  id: EntityId;
} & AuditFields;

/**
 * Generic helper for future entities that share `id` + audit fields.
 */
export type AuditedEntity<T extends object = Record<string, never>> = BaseEntity &
  T;


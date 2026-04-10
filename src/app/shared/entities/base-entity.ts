import { Entity, TypedEntity } from '../../core/models/entity';

export type EntityId = Entity['id'];
export type AuditFields = Omit<Entity, 'id'>;
export type BaseEntity = Entity;

/**
 * Backward-compatible alias for existing feature models.
 */
export type AuditedEntity<T extends object = Record<string, never>> = TypedEntity<T>;


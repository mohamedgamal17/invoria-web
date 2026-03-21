import { AuditedEntity } from '../../../shared/entities/base-entity';

export type Customer = AuditedEntity<{
  name: string;
}>;

export type CustomerCreateInput = Pick<Customer, 'name'>;
export type CustomerUpdateInput = Pick<Customer, 'name'>;

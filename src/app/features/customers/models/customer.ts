import { TypedEntity } from '../../../core/models/entity';

export type Customer = TypedEntity<{
  name: string;
}>;

export type CustomerCreateInput = Pick<Customer, 'name'>;
export type CustomerUpdateInput = Pick<Customer, 'name'>;

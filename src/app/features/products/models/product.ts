import { AuditedEntity } from '../../../shared/entities/base-entity';

export type Product = AuditedEntity<{
  name: string;
  code: string;
  price: number;
  actualQuantity: number;
  reservedQuantity: number;
}>;

export type ProductCreateInput = Pick<Product, 'name' | 'code' | 'price'>;
export type ProductUpdateInput = Pick<Product, 'name' | 'code' | 'price'>;


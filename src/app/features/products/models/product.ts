import { TypedEntity } from '../../../core/models/entity';

export type Product = TypedEntity<{
  name: string;
  code: string;
  price: number;
  actualQuantity: number;
  reservedQuantity: number;
}>;

export type ProductCreateInput = Pick<Product, 'name' | 'code' | 'price'>;
export type ProductUpdateInput = Pick<Product, 'name' | 'code' | 'price'>;


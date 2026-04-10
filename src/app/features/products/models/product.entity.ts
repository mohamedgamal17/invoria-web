import { Entity } from '../../../core/models/entity';

export interface Product extends Entity {
  name: string;
  code: string;
  price: number;
  actualQuantity: number;
  reservedQuantity: number;
}

/** UI/mock draft shape for create/update (not the HTTP body). */
export type ProductCreateInput = Pick<Product, 'name' | 'code' | 'price'>;
export type ProductUpdateInput = Pick<Product, 'name' | 'code' | 'price'>;

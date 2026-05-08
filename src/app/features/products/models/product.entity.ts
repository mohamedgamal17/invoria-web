import { Entity } from '../../../core/models/entity';

export interface ProductStock {
  actualQuantity: number;
  reservedQuantity: number;
}

export interface Product extends Entity {
  name: string;
  price: number;
  stock: ProductStock;
}



import { Entity } from '../../../core/models/entity';
import type { ReturnStatus } from './return-status.enum';

export interface ReturnProduct {
  id: string;
  name: string;
  price: number;
}

export interface ReturnLine {
  id: string;
  returnId: string;
  orderItemId: string;
  productId: string;
  quantity: number;
  product: ReturnProduct | null;
}

export interface Return extends Entity {
  type: number;
  status: ReturnStatus;
  returnLines: ReturnLine[];
  allocationId: string | null;
  orderId: string | null;
}

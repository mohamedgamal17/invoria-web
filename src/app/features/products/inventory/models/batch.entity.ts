import { Entity } from '../../../../core/models/entity';

export enum BatchState {
  Active = 'Active',
  Depleted = 'Depleted',
  Disabled = 'Disabled'
}

export interface Batch extends Entity {
  productId: string;
  quantity: number;
  reservedQuantity: number;
  state: BatchState;
  purchasePrice: number;
}

/** Form output; modal maps to CreateBatchRequest / UpdateBatchRequest. */
export type BatchFormSavePayload = Pick<Batch, 'quantity' | 'purchasePrice'>;

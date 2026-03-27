export enum BatchState {
  Active = 'Active',
  Depleted = 'Depleted',
  Disabled = 'Disabled'
}

export interface Batch {
  id: string;
  productId: string;
  quantity: number;
  reservedQuantity: number;
  state: BatchState;
  purchasePrice: number;
}

export type BatchCreateInput = Pick<Batch, 'productId' | 'quantity' | 'purchasePrice'>;
export type BatchUpdateInput = Pick<Batch, 'quantity' | 'purchasePrice'>;

export interface BatchPagedResponse {
  items: Batch[];
  total: number;
}

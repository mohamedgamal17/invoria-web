import type { AddReturnLineItemRequest } from './add-return-items.request';

export interface CompleteOrderRequest {
  returnItems?: AddReturnLineItemRequest[];
}

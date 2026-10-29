/**
 * Body for POST /payables/{id}/settle (Swagger `SettlePayableRequest`).
 * The amount is validated server-side against the payable's outstanding balance.
 */
export interface SettlePayableRequest {
  Amount: number;
}

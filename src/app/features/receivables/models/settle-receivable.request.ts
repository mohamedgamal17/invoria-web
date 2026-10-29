/**
 * Body for POST /receivables/{id}/settle (Swagger `SettleReceivableRequest`).
 * The amount is validated server-side against the receivable's outstanding balance.
 */
export interface SettleReceivableRequest {
  Amount: number;
}

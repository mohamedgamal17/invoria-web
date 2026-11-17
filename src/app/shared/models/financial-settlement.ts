/** Settlement row shared by payable and receivable settlement tables. */
export interface FinancialSettlement {
  id: string;
  amount: number;
  settledAt: string;
}

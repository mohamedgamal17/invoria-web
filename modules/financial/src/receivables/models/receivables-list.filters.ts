/** Query-string filters of the receivables list. */
export interface ReceivablesListFilters {
  partyId: string;
  sourceId: string;
  isPaid: boolean | null;
}

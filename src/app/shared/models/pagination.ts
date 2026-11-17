/**
 * Shared pagination contracts for component lists and paginator wiring.
 * Single source of truth for page-size options and paginator event/state types.
 */
export const DEFAULT_PAGE_SIZE = 25;

/**
 * Default paginator page-size options.
 * Consumed both by shared {@link DEFAULT_PAGE_SIZE} math and PrimeNG
 * `[rowsPerPageOptions]` bindings, so typed as a mutable `number[]`
 * (treat as read-only; do not mutate).
 */
export const DEFAULT_PAGE_SIZE_OPTIONS: number[] = [25, 50, 100, 200];

/** Page size for compact metrics/report tables. */
export const COMPACT_PAGE_SIZE = 10;

/** Page-size options for compact metrics/report tables. */
export const COMPACT_PAGE_SIZE_OPTIONS: number[] = [5, 10, 20];

/**
 * Standard page-change event contract for every list/paginator `pageChange`
 * output and `onPageChange` handler. A structural supertype of PrimeNG
 * `PaginatorState` (`p-paginator`) and `TablePageEvent` (`p-table`), so
 * consumers must use this type instead of a union of the PrimeNG types.
 */
export interface PaginatorPageEvent {
  first?: number;
  rows?: number;
  page?: number;
  pageCount?: number;
  totalRecords?: number;
}

/** Derived 0-based page index plus page size after a paginator event. */
export interface PageState {
  readonly pageIndex: number;
  readonly pageSize: number;
}

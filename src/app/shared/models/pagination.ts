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

/** PrimeNG paginator page-change event shape (subset needed for paging math). */
export interface PaginatorPageEvent {
  first?: number;
  rows?: number;
  page?: number;
}

/** Derived 0-based page index plus page size after a paginator event. */
export interface PageState {
  readonly pageIndex: number;
  readonly pageSize: number;
}

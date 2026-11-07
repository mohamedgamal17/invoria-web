/**
 * Canonical status machine for any async request slice.
 * Shared across stores so the idle/loading/loaded/error lifecycle is
 * defined (and typed) exactly once.
 */
export const LOAD_STATUS = {
  /** Initial state — never fetched (e.g. the orders tab not opened yet). */
  Idle: 'idle',
  /** A request is in flight. */
  Loading: 'loading',
  /** The last request completed successfully. */
  Loaded: 'loaded',
  /** The last request failed; `error` carries the toast-ready detail. */
  Error: 'error',
} as const;

export type LoadStatus = (typeof LOAD_STATUS)[keyof typeof LOAD_STATUS];

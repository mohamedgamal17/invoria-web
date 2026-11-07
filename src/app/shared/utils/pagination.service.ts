import { Injectable } from '@angular/core';
import {
  DEFAULT_PAGE_SIZE,
  DEFAULT_PAGE_SIZE_OPTIONS,
  PageState,
  PaginatorPageEvent,
} from '../models/pagination';

/**
 * Shared pagination helpers: page-size validation and paginator-event math.
 * Keeps components free of duplicated paging glue code.
 */
@Injectable({ providedIn: 'root' })
export class PaginationService {
  readonly pageSizeOptions: number[] = DEFAULT_PAGE_SIZE_OPTIONS;

  /** Parses a non-negative integer; falls back to 0 when missing or invalid. */
  parseNonNegativeInt(raw: number | null): number {
    const parsedValue = raw === null ? 0 : raw;
    return Number.isFinite(parsedValue) && parsedValue >= 0 && Number.isInteger(parsedValue)
      ? parsedValue
      : 0;
  }

  /** Parses a page size and rejects values outside {@link pageSizeOptions}; falls back to the default size. */
  normalizePageSize(raw: number | null): number {
    const parsedValue = this.parseNonNegativeInt(raw);
    return this.pageSizeOptions.includes(parsedValue) ? parsedValue : DEFAULT_PAGE_SIZE;
  }

  /**
   * Parses a query-param `pageSize` value against the given options, falling
   * back to the first (default) page size when missing or invalid.
   */
  pageSizeFromQuery(
    raw: number | null,
    options: readonly number[] = DEFAULT_PAGE_SIZE_OPTIONS,
  ): number {
    const parsedValue = this.parseNonNegativeInt(raw);
    return options.includes(parsedValue) ? parsedValue : (options[0] ?? DEFAULT_PAGE_SIZE);
  }

  /** First visible row index (`first`) for a 0-based pageIndex. */
  firstFrom(pageIndex: number, pageSize: number): number {
    return pageIndex * pageSize;
  }

  /**
   * Derives the 0-based page index from a paginator event, preferring the
   * `page` field and falling back to `first / rows`.
   */
  pageIndexFromEvent(event: PaginatorPageEvent, fallbackRows: number): PageState {
    const rows = this.normalizePageSize(event.rows ?? fallbackRows);
    const pageIndex =
      event.page !== undefined ? event.page : Math.floor((event.first ?? 0) / Math.max(rows, 1));
    return { pageIndex, pageSize: rows };
  }
}

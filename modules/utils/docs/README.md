# @invoria/utils

Shared utilities, models, formatters, Angular directives, and NgRx error-handling infrastructure.

## Public API Surface

### 1. Formatting & Utils
- `formatCurrency(value, currencyCode?)`: Formats numeric amounts using `Intl.NumberFormat` with default currency `EGP`.
- `formatNumber(value)`: Formats standard numbers with thousands separators.
- `copyToClipboard(text)`: Safe asynchronous clipboard copying with fallback.
- `DebounceInputDirective`: Attribute directive debouncing input events by `300ms`.
- `toSelectOptions(items, labelKey, valueKey)`: Transforms entities to PrimeNG select options.
- `phoneValidator`, `postalCodeValidator`, `taxNumberValidator`, `commercialRegisterValidator`: Reactive Form validators.

### 2. State & Pagination
- `PaginationService`: Helper for managing page index, page size, and offset math.
- `UrlStateService`: Signal-based synchronization of URL query parameters.
- `AsyncRequestState`, `INITIAL_ASYNC_REQUEST_STATE`, `startLoading`, `applyFailure`: Standard async reducer state helper.

### 3. Charts
- `ECHARTS_PALETTE`: Semantic theme-aware color palette.
- `ECHARTS_GRID_COMPACT`: Preset grid options for compact card charts.
- `buildChartPlaceholderOption(period)`: Generates empty-state chart options.

### 4. Shared Models
- `CurrencyCode`, `DEFAULT_CURRENCY_CODE` (`'EGP'`).
- `FinancialObligation`, `FinancialSettlement`, `FinancialObligationStatus`.
- `PaginationState`, `PageEvent`.
- `ReportPeriod`, `ReportOverview`.

### 5. Error Store Effects
- `AppErrorEffects`: Dispatches toasts and navigates to error pages upon `APP_ERROR_ACTIONS.apiError`.

## Integration Guide

```typescript
import {
  formatCurrency,
  DEFAULT_CURRENCY_CODE,
  PaginationService,
  AsyncRequestState,
  startLoading,
  applyFailure
} from '@invoria/utils';
```

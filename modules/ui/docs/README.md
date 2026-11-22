# @invoria/ui

Shared presentational UI library for Invoria Web, implementing the AuraInvoria design system and PrimeNG components with Tailwind CSS v4 semantic tokens.

## Components Catalog

1. **`AutosearchComponent` (`<app-autosearch>`)**
   - Reusable typeahead autocomplete input implementing `ControlValueAccessor`.
   - Used for selecting referenced entities like customers, products, and suppliers.

2. **`ChartCardComponent` (`<app-chart-card>`)**
   - Standard chart container wrapping `ngx-echarts` with title, period selector, and empty state placeholder.

3. **`ConfirmDialogComponent` (`<app-confirm-dialog>`) & `ConfirmDialogService`**
   - Centralized confirmation dialog wrapper over PrimeNG's `p-confirmDialog`.
   - Components inject `ConfirmDialogService` and subscribe to `confirm()` which returns an `Observable<boolean>`.

4. **`DetailsSkeletonComponent` (`<app-details-skeleton>`)**
   - Loading placeholder for detail and edit views.

5. **`DetailsToolbarComponent` (`<app-details-toolbar>`)**
   - Top action toolbar for detail pages with back navigation, edit/delete actions, and status badges.

6. **`EmptyStateComponent` (`<app-empty-state>`)**
   - Zero-data UI with customizable icon, title, description, and action button.

7. **`ErrorCardComponent` (`<app-error-card>`)**
   - Visual card displaying error state with retry action.

8. **`FinancialObligationListComponent` (`<app-financial-obligation-list>`)**
   - Tabular presentation of payables and receivables.

9. **`FinancialObligationOverviewCardComponent` (`<app-financial-obligation-overview-card>`)**
   - Financial obligation summary KPIs.

10. **`KpiCardComponent` (`<app-kpi-card>`)**
    - Metric summary card showing numeric values, trends, and change percentages.

11. **`ListSkeletonComponent` (`<app-list-skeleton>`)**
    - Loading skeleton placeholder for list tables.

12. **`NameFilterPanelComponent` (`<app-name-filter-panel>`)**
    - Standard search and filter panel with query input and debounce.

13. **`PageHeaderComponent` (`<app-page-header>`)**
    - Top breadcrumb and page title banner.

14. **`ReportPeriodFilterPanelComponent` (`<app-report-period-filter-panel>`)**
    - Period selector (Daily, Weekly, Monthly, Yearly) for analytics views.

15. **`SettleModalComponent` (`<app-settle-modal>`)**
    - Modal dialog for settling financial obligations.

16. **`SettlementsTabComponent` (`<app-settlements-tab>`)**
    - Embedded settlement history tab.

17. **`StatusStepsComponent` (`<app-status-steps>`)**
    - Multi-step status progression component for orders and purchase orders.

18. **`SurfaceCardComponent` (`<app-surface-card>`)**
    - Elevated container card with standard border and background styling.

## Design Rules
- Never use hardcoded hex/rgb colors. Always use semantic Tailwind classes (`bg-surface`, `text-foreground`, `border-border`, etc.).
- All components use `ChangeDetectionStrategy.OnPush`.
- Never inject feature services or `Router` directly inside these presentational components.

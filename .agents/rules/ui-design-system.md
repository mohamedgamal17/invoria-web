# UI Design System & Component Guidelines

This rule defines UI component selection, styling conventions, design tokens, and shared primitives for **Invoria Web**.

---

## 1. PrimeNG First Strategy

Always prefer PrimeNG 21 components over custom HTML/CSS for interactive primitives:
- **Tables & Lists**: `p-table` (desktop), `p-card` (mobile cards).
- **Dialogs & Drawers**: `p-dialog`, `p-drawer`. Never roll custom overlay logic.
- **Form Controls**: `p-inputNumber`, `p-inputtext`, `p-select`, `p-datepicker`, `p-checkbox`, `p-toggleSwitch`.
- **Buttons**: `p-button` with standard severities (`primary`, `secondary`, `success`, `danger`, `warn`). Never use unstyled native `<button>`.
- **Badges & Tags**: `p-tag` with semantic severity values.
- **Feedback & Notifications**: `p-toast` (global), `p-message` (inline/form errors).
- **Theming**: PrimeNG is styled via the custom `AuraInvoria` preset (`src/styles/primeng/aura.preset.ts`). It automatically respects dark mode via the `.dark` class.

---

## 2. Tailwind CSS v4 & Semantic Design Tokens

Invoria Web uses Tailwind CSS 4 with a CSS-first configuration:
- Core tokens live in `src/styles/tokens.css` (CSS variables for light and dark themes).
- `@theme` mapping lives in `src/styles.css`.

### Semantic Tokens vs. Palette Hues
- **Rule**: Use semantic tokens exclusively for layout, typography, borders, backgrounds, and status indications.
- **Prohibition on Raw Palette Hues**: Never use Tailwind color palette names (`emerald`, `amber`, `red`, `blue`, `slate`) in component markup or styles.

| Semantic Class | Usage | Prohibited Equivalent |
|---|---|---|
| `bg-surface` / `text-foreground` | Main container and card backgrounds | `bg-white`, `text-gray-900` |
| `bg-surface-2` | Secondary cards, subtle panels | `bg-gray-50`, `bg-slate-100` |
| `border-border` | Component borders and dividers | `border-gray-200` |
| `text-muted-foreground` | Secondary or helper text | `text-gray-500` |
| `text-primary` / `bg-primary` | Primary brand accent and actions | `text-blue-600`, `bg-blue-600` |
| `text-success` / `bg-success` | Positive state, completed badges | `text-emerald-600`, `bg-green-500` |
| `text-warning` / `bg-warning` | Pending, review required | `text-amber-600`, `bg-yellow-500` |
| `text-danger` / `bg-danger` | Failed, error, destructive action | `text-red-600`, `bg-red-500` |

### CSS Animations & Component Styles
- Keep component-scoped styles empty or minimal (`styles: []`).
- Shared animations (such as `.pulse-beat`) reside centrally in `src/styles.css`. Do not declare `@keyframes` in component stylesheets.

---

## 3. Shared UI Primitives (`src/app/shared/ui/`)

Before creating markup for a feature component, inspect and reuse the shared primitives:

| Component Selector | File Location | Purpose & Props |
|---|---|---|
| `app-chart-card` | `shared/ui/chart-card/` | The only ECharts wrapper in the application. Supports title, options, loading, and period selector. |
| `app-kpi-card` | `shared/ui/kpi-card/` | KPI metrics tile with `tone` (`primary`, `success`, `warning`, `danger`). |
| `app-list-skeleton` | `shared/ui/list-skeleton/` | Unified loading skeleton for tables and lists driven by `ListSkeletonColumn[]`. |
| `app-name-filter-panel` | `shared/ui/name-filter-panel/` | Debounced text filter panel emitting `filtersChange` and `clearFilters`. |
| `app-status-steps` | `shared/ui/status-steps/` | Stepper and timeline visualization for order/return workflows. |
| `app-settle-modal` | `shared/ui/settle-modal/` | Modal dialog for payable and receivable settlement. |
| `app-autosearch` | `shared/ui/autosearch/` | CVA typeahead search component with debounced delegation to smart page. |
| `app-page-header` | `shared/ui/page-header/` | Standardized header container for titles, breadcrumbs, and primary page actions. |
| `app-confirm-dialog` | `shared/ui/confirm-dialog/` | Host component for application-wide confirmation dialogs. |

---

## 4. ECharts & Data Visualization Standards

- **Libraries**: `echarts` (^6.1.0) and `ngx-echarts` (^21.0.0).
- **Registration**: Registered once globally in `src/app/app.config.ts` via `provideEchartsCore({ echarts })` with tree-shaken components. Never add per-component providers.
- **Prohibitions**: Do not introduce `primeng/chart` or `Chart.js`.
- **Card Wrapper**: Always wrap charts with `<app-chart-card [options]="chartOptions()" [loading]="isLoading()" />`.
- **Presets**: Import `ECHARTS_PALETTE` and `ECHARTS_GRID_COMPACT` from `src/app/shared/charts/echarts-presets.ts`. Never hardcode raw hex values in options.

---

## 5. Currency, Numbers & Formatting

- **Currency Code**: `DEFAULT_CURRENCY_CODE = 'EGP'` from `src/app/shared/models/currency.ts`. Never hardcode `'USD'` or `'EGP'` string literals.
- **Formatting Utilities**: Use `formatCurrency(amount)` and `formatNumber(value)` from `src/app/shared/utils/format.ts`.
- **Component Field Exposure**: Expose formatting functions as `readonly formatCurrency = formatCurrency;` in component classes for template consumption. Never create ad-hoc `Intl.NumberFormat` instances in components.
- **Paging Defaults**: Import `DEFAULT_PAGE_SIZE` (25) and `DEFAULT_PAGE_SIZE_OPTIONS` (`[25, 50, 100, 200]`) from `src/app/shared/models/pagination.ts`.

# Design Consistency Rules

## Purpose

This file defines enforceable UI consistency rules for the project.  
Use it with the [docs index](../README.md) and [Architecture overview](./overview.md) to avoid design drift, reduce unmanaged custom styling, and keep feature UIs predictable across teams.

## Mandatory UI Stack Rules

1. PrimeNG must be used for interactive UI primitives whenever an equivalent exists.
2. Tailwind must be used for layout, spacing, typography, responsive behavior, and light visual adjustments.
3. Component-scoped CSS (`styles: []`, `.component.css/.scss`) must be avoided unless there is a clear PrimeNG interop need that cannot be solved by PrimeNG API + Tailwind classes. Shared keyframes/animations live in `src/styles.css` (`@keyframes` + utility class), not in components.
4. Angular Signals must manage local UI state in components; inputs/outputs use `input()` / `output()` / `model()`, not `@Input()` / `@Output()`.
5. Services must expose Observables for async operations; smart pages/store effects perform the calls — presentational components never inject an API service, `Router`, or `MessageService`.
6. Standalone components are the default.
7. Cross-feature UI primitives come from `shared/ui` (`app-chart-card`, `app-kpi-card`, `app-list-skeleton`, `app-name-filter-panel`, `app-status-steps`, `app-settle-modal`, `app-autosearch`, `app-confirm-dialog`, `app-page-header`) — do not re-implement them per feature.
8. Money and counts render through `shared/utils/format.ts` (`formatCurrency` / `formatNumber`); currency is `DEFAULT_CURRENCY_CODE` (`EGP`) from `shared/models/currency.ts` — never a hardcoded `'USD'` / `'EGP'` literal.

## Allowed vs Disallowed Patterns

### Allowed

- PrimeNG components such as `p-dialog`, `p-drawer`, `p-table`, `p-paginator`, `p-card`, `p-inputNumber`, `p-message`, `p-toast`, `p-tag`, `p-toolbar`, `p-divider`.
- Tailwind utility classes for structure and minor styling.
- Semantic utility classes already established in the app, for example:
  - `bg-surface`
  - `text-foreground`
  - `text-muted-foreground`
  - `border-border`
  - `text-primary`
  - `text-success`, `text-warning`, `text-danger` (status/tone states)
- Minimal `::ng-deep` only when PrimeNG internals cannot be controlled via documented inputs, templates, or class hooks.

### Disallowed

- Rebuilding existing PrimeNG controls with native HTML/CSS (custom dialogs, custom drawers, custom pagination, custom toasts).
- Hard-coded visual values in components where semantic utilities are available:
  - Hex/rgb/hsl colors
  - Arbitrary z-index scales not in Tailwind classes
  - Large bespoke shadows/radii systems
- Tailwind palette hues for status/tone semantics (`text-emerald-600`, `text-red-500`, `bg-amber-100`, …). Tones use semantic tokens (`success` / `warning` / `danger`) — the only place raw palette values are allowed is `ECHARTS_PALETTE` in `shared/charts/echarts-presets.ts`, where chart series colors are defined centrally.
- Large component-level CSS blocks that replicate what Tailwind + PrimeNG already provide.
- Inline style attributes for normal styling concerns when class-based styling can express the same behavior.

## Component Authoring Rules

### Container/Page Components

- Orchestrate data loading, mutations, and UI visibility.
- Own service calls and map responses to signals.
- Pass data/events to presentational components via `input()` / `output()`.

### Presentational Components

- Must remain reusable and side-effect-light.
- Must not call API services directly, and must not inject `Router`, `ActivatedRoute`, or `MessageService`.
- Must accept state from parent and emit intent events (`input()` / `output()` / `model()`).
- Reuse the shared primitives listed in [overview.md §8](./overview.md#8-ui--design-system) (lists' skeleton, name filter panel, KPI card, chart card, status steps, settle modal) instead of local variants.

### Forms

- Use Reactive Forms for non-trivial forms; never `[(ngModel)]` or mutate input arrays in place.
- Use PrimeNG form controls first; custom controls (`app-autosearch`) implement `ControlValueAccessor` and are bound with `formControlName`.
- Validation feedback should use PrimeNG messaging components and semantic Tailwind classes.
- Pages submit plain payloads; the page — not the form component — performs the API call.

## Styling Rules (PrimeNG + Tailwind)

1. Start with PrimeNG component API:
   - `styleClass`, `contentStyleClass`, slots (`pTemplate`) and built-in props.
2. Use Tailwind for:
   - Layout: `flex`, `grid`, `min-h-0`, `overflow-*`, responsive prefixes (`md:`).
   - Spacing and rhythm: `p-*`, `m-*`, `gap-*`.
   - Typography and semantic text/border/background classes.
3. Keep overlays deterministic:
   - Prefer PrimeNG overlay components (`p-dialog`, `p-drawer`) rather than custom absolute/fixed overlay systems.
4. If custom CSS is unavoidable:
   - Keep it minimal, isolated, and documented with a one-line reason.
   - Avoid visual system overrides; focus only on missing integration hooks.

## Standard PrimeNG Mapping

- Modal workflows: `p-dialog` + `p-drawer` (if side form/panel is needed).
- Data listing: `p-table` for desktop, optionally `p-card` list for mobile.
- Pagination: `p-paginator` or table paginator API.
- Actions: `p-button` variants, not native `<button>` for styled interactions.
- Status badges: `p-tag`.
- Feedback: `p-toast` for global actions, `p-message` for local validation/errors.

## Definition of Done (UI Consistency)

A UI change is done only when all items pass:

- PrimeNG-first: no custom replacement of existing PrimeNG interactive components.
- Tailwind-first styling: layout and visual tweaks are class-driven; status/tone colors are semantic tokens (`text-success`, `text-danger`, `text-warning`), never palette hues.
- No unmanaged CSS: component CSS is absent or minimal with explicit justification; shared animations live in `src/styles.css`.
- Shared primitives reused where applicable (`app-chart-card`, `app-kpi-card`, `app-list-skeleton`, `app-name-filter-panel`, `app-status-steps`, `app-settle-modal`, `app-autosearch`).
- Presentational components have signal I/O only and no API/Router/MessageService injection.
- Responsive behavior works at mobile and desktop breakpoints.
- Validation, loading, disabled, and empty states are represented.
- Accessibility basics exist (labels, button semantics, dismiss behavior for overlays).
- `npm run build` passes with no Angular/TypeScript errors.

## PR Review Checklist

Reviewers should block PRs when any answer is "No":

1. Is every interactive element implemented with PrimeNG where available?
2. Are layout and appearance primarily handled via Tailwind utility classes?
3. Did we avoid hard-coded colors, palette hues for status, and unmanaged style patterns?
4. Are overlays/dialogs/drawers implemented via PrimeNG instead of custom layers?
5. Are Signals and `input()`/`output()` used correctly for local component state and communication?
6. Are service interactions Observable-based and kept out of dumb/presentational components? Are cross-feature services limited to the documented exceptions (overview.md §7)?
7. Does the UI behave correctly on both mobile and desktop?
8. Does the build pass?

## Example Compliant Patterns

### Good

- `p-dialog` for modal shell, `p-drawer` for side edit form.
- `p-table` on desktop and `p-card` list on mobile with `md:` responsive classes.
- `p-message` for validation and `p-toast` for action feedback.
- Tailwind semantic classes for borders/text/surfaces.

### Bad

- Custom fixed overlay + native panel while PrimeNG drawer/dialog exists.
- Mixed random CSS tokens/hex values per component, or `dark:text-emerald-400`-style hue pairing where `text-success` exists.
- Native styled buttons/inputs replacing available PrimeNG components.
- Large `styles: []` blocks for spacing and typography that Tailwind already handles, or per-component `@keyframes` duplicating a global animation.

## Maintenance Rule

When introducing a new UI pattern, update this file in the same PR if the pattern changes expected conventions.  
If a team needs an exception, add a brief "Exception Note" in the PR description with rationale and scope.

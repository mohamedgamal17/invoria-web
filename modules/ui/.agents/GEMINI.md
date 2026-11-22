# @invoria/ui — AI Agent Rules

## Module Purpose
Presentational component library and design system building blocks.

## Allowed Dependencies
- `@invoria/core`, `@invoria/utils`
- `@angular/core`, `@angular/common`, `@angular/forms`, `@angular/router`
- `primeng/*`, `@primeuix/themes`, `primeicons`
- `lucide-angular`, `ngx-echarts`, `echarts`, `rxjs`

## Strict Restrictions
- NEVER import any feature module (`@invoria/customers`, `@invoria/sales`, etc.) or `@invoria/event-bus`.
- NEVER inject feature API services, Router, or ActivatedRoute. Communication must strictly use `input()`, `output()`, and `model()`.
- NEVER use hardcoded hex/rgb colors or raw Tailwind color palette hues (e.g. `bg-red-500`). Use semantic tokens only (`bg-surface`, `text-foreground`, `text-success`, `text-danger`, etc.).
- ALWAYS use external templates (`templateUrl: './<name>.component.html'`). Inline `template:` is forbidden.

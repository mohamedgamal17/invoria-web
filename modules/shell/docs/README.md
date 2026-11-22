# @invoria/shell

Shell application module for Invoria Web.

## Responsibilities
- Application bootstrap (`src/main.ts`, `src/index.html`).
- Application config (`src/app/app.config.ts`), including `provideApiBaseUrl(environment.apiUrl)`.
- Root routing with lazy loaded modules (`src/app/app.routes.ts`).
- App shell layout (`src/app/layout/`): dashboard navbar, sidebar, shell container.
- Global styles and PrimeNG theme presets (`src/styles/`, `src/styles.css`).
- Environments configuration (`src/environments/`).
- Dashboard and error fallback pages.

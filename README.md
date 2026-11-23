# Invoria Web

Invoria Web is the Angular management dashboard for the Invoria ERP. It covers the daily
operations of a retail/wholesale business: products and stock batches, sales orders and
invoices, returns, purchase orders and suppliers, receivables/payables, customers, plus
sales, profit, and procurement reports with KPI charts.

## Tech stack

- **Angular 21** — standalone components, signals, lazy-loaded routes
- **NgRx** — store, effects, router-store for complex paged/detail state
- **PrimeNG + Tailwind CSS 4** — UI components and semantic design tokens
- **ECharts (`ngx-echarts`)** — dashboard and report charts
- **Vitest** — unit tests, **Storybook** — isolated UI stories
- **npm workspaces monorepo** — domain code under `modules/`

## Project structure

```text
modules/
├── shell/            # Bootstrap, app config, environments, global styles
├── management-ui/    # Dashboard layout, sidebar, routes, feature pages
├── core/             # HTTP interceptors, API base URL, base models
├── utils/            # Shared helpers, formatting, pagination, error effects
├── ui/               # Shared presentational components
├── event-bus/        # Cross-module domain events and queries
├── catalog/          # Products feature
├── customers/        # Customers CRM feature
├── sales/            # Orders, invoices, returns feature
├── procurement/      # Purchase orders, suppliers feature
├── financial/        # Receivables, payables feature
└── inventory/        # Product batches and shared batch UI
```

`scripts/` holds build/deployment scripts and `docs/` holds the architecture and guides.
See [docs/README.md](docs/README.md) for the full documentation index.

## Prerequisites

- Node.js `^20.19.0`, `^22.12.0`, or `>=24`
- npm 8 or newer

## Run locally

```bash
npm install
npm start
```

Open <http://localhost:4200>. The app reloads automatically when source files change.

The local development API URL is set in
`modules/shell/src/environments/environment.development.ts` (default
`https://localhost:7012/`). The base `environment.ts` points to `http://localhost:5000/`.
Point it at your running Invoria API before starting the app.

## Useful commands

| Command                 | Description                                       |
| ----------------------- | ------------------------------------------------- |
| `npm start`             | Start the dev server on port 4200                 |
| `npm run build`         | Production build (requires `API_URL`)             |
| `npm test`              | Run unit tests with Vitest                        |
| `npm run typecheck`     | Type-check the workspace without emitting         |
| `npm run format`        | Format files with Prettier                        |
| `npm run storybook`     | Start Storybook on port 6006                      |
| `npm run check:stories` | Verify every presentational component has stories |

## Deploy

Production builds need an `API_URL` environment variable. The build runs
`scripts/generate-production-env.mjs`, which writes
`modules/shell/src/environments/environment.production.ts`, then compiles the app.

```bash
API_URL=https://api.example.com npm run build
```

The static output is written to `dist/invoria-web/browser`.

### Vercel (CI)

Pushing to `master` runs [.github/workflows/vercel-deployment.yml](.github/workflows/vercel-deployment.yml),
which builds and deploys the app to Vercel. Required repository secrets:

- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- `VERCEL_TOKEN`

Also set `API_URL` in the Vercel project's Environment Variables so the production build
can generate the environment file.

### Vercel (manual)

```bash
npm install -g vercel
vercel pull --yes --environment=production
vercel build --prod
vercel deploy --prebuilt --prod
```

[.github/workflows/ci.yml](.github/workflows/ci.yml) runs the build and unit tests on
Node 20 for every push and pull request to `master`.

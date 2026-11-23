# Invoria Web

Invoria Web is the Angular management dashboard for the Invoria ERP. It covers the daily
operations of a retail/wholesale business: products and stock batches, sales orders and
invoices, returns, purchase orders and suppliers, receivables/payables, customers, plus
sales, profit, and procurement reports with KPI charts.

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

[.github/workflows/ci.yml](.github/workflows/ci.yml) runs the build and unit tests on
Node 20 for every push and pull request to `master`.

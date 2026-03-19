# InvoriaWeb

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.2.0.

## Design tokens (Tailwind v4)

Tokens live in:
- `src/styles/tokens.css` (CSS variables for light + dark)
- `src/styles.css` (Tailwind `@theme` mapping)

### Dark mode

Add/remove the `.dark` class on `html` or `body`.

### Token usage in templates

- **Surfaces**: `bg-surface text-foreground`
- **Muted areas**: `bg-muted text-muted-foreground`
- **Borders**: `border border-border`
- **Cards**: `bg-surface-2 rounded-lg shadow-sm border border-border`
- **Primary button**: `bg-primary text-primary-foreground hover:bg-primary/90`
- **Status**:
  - Success: `bg-success text-success-foreground`
  - Warning: `bg-warning text-warning-foreground`
  - Danger: `bg-danger text-danger-foreground`
- **Focus ring**: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus`

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

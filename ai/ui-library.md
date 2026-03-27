You are generating Angular code for a **feature-based modular application**.

Rules:
- Follow feature folder structure under `/features/<feature-name>`
- Use **PrimeNG for components**; Tailwind only for minor layout/styling
- Use **Observables** for async data from services
- Use **Angular 21 Signals** for reactive state/properties
- Follow Angular best practices (modules, services, Reactive Forms)
- Components are reusable; pages handle orchestration
- Services handle API calls only
- Include proper imports, providers, and module declarations
- Generate clean, production-ready Angular code
- Output should include HTML template, TypeScript component, SCSS/CSS if needed
- Reuse models and services within the feature module

Task:
[Describe the specific page or component, e.g., "Create a Create Order modal page where users can search products, select quantities, and add multiple items. Include form validation and display order items using a table component."]
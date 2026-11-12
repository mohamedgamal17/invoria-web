# Architecture docs — index

Reference docs for the app's architecture. One entry per doc in this folder, with
per-section anchors, so navigation starts here. The overall docs map is
[../README.md](../README.md).

| Doc | Read when | Key sections |
|-----|-----------|--------------|
| [overview.md](overview.md) | Onboarding, structural changes, dependency-rule questions, choosing a state pattern | [§4 Component design](overview.md#4-component-design) · [§5 State management](overview.md#5-state-management) · [§7 Dependency rules](overview.md#7-dependency-rules) · [§8 UI & design system](overview.md#8-ui--design-system) · [§9 API communication](overview.md#9-api-communication) |
| [component-design.md](component-design.md) | Building/refactoring smart pages (NgRx or signals), presentational components, feature store modules, confirmation dialogs | [§1 Feature layout](component-design.md#1-feature-layout) · [§2 Smart page (NgRx)](component-design.md#2-smart-page-customerspagecomponent) · [§3 NgRx store modules](component-design.md#3-ngrx-feature-store-modules-customers-reference) · [§4 Presentational](component-design.md#4-presentational-components) · [§8 Identifier naming](component-design.md#8-identifier-naming) · [§9 Signals pages](component-design.md#9-signals-based-smart-pages-orderssuppliers-reference) · [§10 Confirmation dialogs](component-design.md#10-confirmation-dialogs-shared-confirmdialogservice) |
| [api-services-and-models.md](api-services-and-models.md) | Adding entities, request types, or typed API services | [Scope](api-services-and-models.md#scope) · [Entity files](api-services-and-models.md#entity-files-entitynameentityts) · [Request files](api-services-and-models.md#request-files-action-entityrequestts) · [Shared request bases](api-services-and-models.md#shared-request-bases) · [API services](api-services-and-models.md#api-services--apiservicets) |
| [design-consistency.md](design-consistency.md) | UI work (PrimeNG/Tailwind styling) and PR review | [Allowed vs disallowed](design-consistency.md#allowed-vs-disallowed-patterns) · [Component authoring](design-consistency.md#component-authoring-rules) · [Styling rules](design-consistency.md#styling-rules-primeng--tailwind) · [PrimeNG mapping](design-consistency.md#standard-primeng-mapping) · [PR checklist](design-consistency.md#pr-review-checklist) |

## Maintenance

When a doc is added, renamed, or removed in this folder, update this index and the
aggregator [../README.md](../README.md) in the same PR (see the `maintaining-docs` skill).
